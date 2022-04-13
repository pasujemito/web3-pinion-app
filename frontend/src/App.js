import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from 'react-toastify';
import abi from "./utils/PinionApp.json"

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [textarea, setTextarea] = useState("");
  const [allHearts, setAllHearts] = useState("");

  // address from deployed contract - get from alchemy
  // must UPDATE on EVERY deployment
  const contractAddress = "0xa6c60f58c0b5c9dd12755cb98bc853bc409d956e"
  const contractABI = abi.abi

  toast.configure()

  const Notification = {
    Success: 'Success',
    Error: 'Error',
    Warning: 'Warning',
    Info: 'Info',
  };

  const alertNotification = (type, message) => {

    const options = {
      position: toast.POSITION.TOP_CENTER,
      autoClose:5000
    }

    if (type == Notification.Success) {
      toast.success(message, options)
    }

    if (type == Notification.Error) {
      toast.error(message, options)
    }

    if (type == Notification.Warning) {
      toast.warning(message, options)
    }

    if (type == Notification.Info) {
      toast.info(message, options)
    }

  }

  const checkIfWalletIsConnected = async () => {
    try {
      // this will initialise etherium plugins!
      const { ethereum } = window;

      if (!ethereum) {
        alertNotification(Notification.Info, "Make sure to install Metamask!")
      } else {
        console.log("🟦 Etherium initialised...");
      }

      // check for waller access permissions
      const accounts = await ethereum.request({
        method: "eth_accounts"
      });

      if (accounts.length > 0) {

        // set default account
        setCurrentAccount(accounts[0])

        alertNotification(Notification.Success, `${accounts[0]} found and set!`)
        fetchUsers()

      } else {
        alertNotification(Notification.Error, "Account not found!")
      }

    } catch (error) {
      alertNotification(Notification.Error, "Unknown error occured, check console for details!")
      console.log("Error found: ", error)
    }
  }

  // connect to wallet
  const connectWallet = async () => {

    try {
      
      const { ethereum } = window;

      if (!ethereum) {
        alertNotification(Notification.Info, "You need to connect metamask first!")
        return
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });

      console.log("Connected Account", accounts[0])
      alertNotification(Notification.Success, `${accounts[0]} account connected`)
      setCurrentAccount(accounts[0])

    } catch (error) {
      alertNotification(Notification.Error, "Unknown error occured, check console for details!")
      console.log("Error found: ", error)
    }
  }

  // get total likes from blockchain
  const like = async (value = false) => {
    try {

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner();
        const getContract = new ethers.Contract(contractAddress, contractABI, signer);

        let getMessage

        if (value == "love") {
          getMessage = "💚"
        } else {
          getMessage = textarea
          setTextarea(" ")
        }

        const likeTxn = await getContract.like(getMessage, { gasLimit: 300000})
        console.log("Processing message: ", getMessage, likeTxn)
        alertNotification(Notification.Success, "Processing your comment...")
        await likeTxn.wait();
        console.log("Processed: ", likeTxn.hash)

      } else {
        alertNotification(Notification.Error, "Ethereum object does not exist!")
      }
      
    } catch (error) {
      alertNotification(Notification.Error, "Unknown error occured, check console for details!")
      console.log("Error found: ", error)
    }
  }

  const fetchUsers = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const getContract = new ethers.Contract(contractAddress, contractABI, signer)
        const users = await getContract.getAllUsers()

        let count = await getContract.getTotalLikes();
        setAllHearts(count.toNumber())

        let userArray = users.map(like => { 
          return {
            address: like.user,
            timestamp: new Date(like.timestamp * 1000),
            message: like.message
          };
        });

        setAllUsers(userArray)
      } else {
        alertNotification(Notification.Error, "Ethereum object does not exist!")
      }
        
      
    } catch (error) {
      alertNotification(Notification.Error, "Unknown error occured, check console for details!")
      console.log("Error found: ", error)
    }
  }

  useEffect(() => {
    let pinionContract;

    const onNewLike = (from, timestamp, message) => {
      console.log("New Pinion: ", from, timestamp, message);
      setAllUsers(prevState => [
        ...prevState, {
          address: from,
          timestamp: new Date (timestamp * 1000),
          message: message
        }
      ])
    }

    const onNewHeart = () => {
      setAllHearts(prevState => prevState + 1)
    }
    const { ethereum } = window
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner();

      pinionContract = new ethers.Contract(contractAddress, contractABI, signer)
      pinionContract.on("SetLike", onNewLike)
      pinionContract.on("SetLike", onNewHeart)
    }

    return () => {
      if (pinionContract) {
        pinionContract.off("SetLike", onNewLike)
        pinionContract.off("SetLike", onNewHeart)
      }
    }
  }, [])


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer app">
    <div className="dataContainer app">
      <div className="body app">
          <h2>🦁 Pinion on Web3!</h2>
          <p>
            "Pinions are your own!" - Web3
          </p>
          <button className="gradient-button gradient-button-1" value="love" onClick={e => like(e.target.value)}>💚 {allHearts}</button>
          {!currentAccount && (
            <button className="gradient-button gradient-button-1" onClick={connectWallet}>Connect Wallet 👛</button>
          )}
          <ul className="all-messages">
          {currentAccount && allUsers.map((user, index) => {

            return (

              <li key={index}>
                <div className="message-data align-right">
                  <span className="message-data-time" >{user.timestamp.toString()}</span> &nbsp; &nbsp;
                  <span className="message-data-name" >{user.address}</span> <i className="fa fa-circle me"></i>
                </div>
                <div className="message other-message float-right">{user.message}</div>
              </li>)

          })}
          </ul>

      </div>
      <div className="message-box">
        <textarea value={textarea} onChange={(e) => setTextarea(e.target.value)} type="text" className="message-input" placeholder="Type message..."></textarea>
        <button type="submit" className="message-submit" onClick={like}>Send</button>
      </div>
    </div>
  </div>
  )

}

export default App;

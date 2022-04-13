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
          <div className="social-header">
            <a href="https://github.com/pasujemito/web3-pinion-app">
              <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMC8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQnPjxzdmcgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMzIgMzIiIGhlaWdodD0iMzJweCIgaWQ9IkxheWVyXzEiIHZlcnNpb249IjEuMCIgdmlld0JveD0iMCAwIDMyIDMyIiB3aWR0aD0iMzJweCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTYuMDAzLDBDNy4xNywwLDAuMDA4LDcuMTYyLDAuMDA4LDE1Ljk5NyAgYzAsNy4wNjcsNC41ODIsMTMuMDYzLDEwLjk0LDE1LjE3OWMwLjgsMC4xNDYsMS4wNTItMC4zMjgsMS4wNTItMC43NTJjMC0wLjM4LDAuMDA4LTEuNDQyLDAtMi43NzcgIGMtNC40NDksMC45NjctNS4zNzEtMi4xMDctNS4zNzEtMi4xMDdjLTAuNzI3LTEuODQ4LTEuNzc1LTIuMzQtMS43NzUtMi4zNGMtMS40NTItMC45OTIsMC4xMDktMC45NzMsMC4xMDktMC45NzMgIGMxLjYwNSwwLjExMywyLjQ1MSwxLjY0OSwyLjQ1MSwxLjY0OWMxLjQyNywyLjQ0MywzLjc0MywxLjczNyw0LjY1NCwxLjMyOWMwLjE0Ni0xLjAzNCwwLjU2LTEuNzM5LDEuMDE3LTIuMTM5ICBjLTMuNTUyLTAuNDA0LTcuMjg2LTEuNzc2LTcuMjg2LTcuOTA2YzAtMS43NDcsMC42MjMtMy4xNzQsMS42NDYtNC4yOTJDNy4yOCwxMC40NjQsNi43Myw4LjgzNyw3LjYwMiw2LjYzNCAgYzAsMCwxLjM0My0wLjQzLDQuMzk4LDEuNjQxYzEuMjc2LTAuMzU1LDIuNjQ1LTAuNTMyLDQuMDA1LTAuNTM4YzEuMzU5LDAuMDA2LDIuNzI3LDAuMTgzLDQuMDA1LDAuNTM4ICBjMy4wNTUtMi4wNyw0LjM5Ni0xLjY0MSw0LjM5Ni0xLjY0MWMwLjg3MiwyLjIwMywwLjMyMywzLjgzLDAuMTU5LDQuMjM0YzEuMDIzLDEuMTE4LDEuNjQ0LDIuNTQ1LDEuNjQ0LDQuMjkyICBjMCw2LjE0Ni0zLjc0LDcuNDk4LTcuMzA0LDcuODkzQzE5LjQ3OSwyMy41NDgsMjAsMjQuNTA4LDIwLDI2YzAsMiwwLDMuOTAyLDAsNC40MjhjMCwwLjQyOCwwLjI1OCwwLjkwMSwxLjA3LDAuNzQ2ICBDMjcuNDIyLDI5LjA1NSwzMiwyMy4wNjIsMzIsMTUuOTk3QzMyLDcuMTYyLDI0LjgzOCwwLDE2LjAwMywweiIgZmlsbD0iIzE4MTYxNiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PGcvPjxnLz48Zy8+PGcvPjxnLz48Zy8+PC9zdmc+"/>
            </a>
            < a href="https://twitter.com/damianjanik_dev">
              <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUxMiA1MTIiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48Zz48cGF0aCBkPSJNNCw0NDAuNWM1NS42LDUsMTA1LjctOSwxNTEuMy00My4yYy00Ny43LTQuMi03OS42LTI4LTk3LjQtNzIuNmMxNS42LDEuOSwzMC4yLDIuNCw0NS43LTEuOCAgIGMtNTEuNC0xNi03OC44LTQ5LjYtODIuNS0xMDMuOGMxNS40LDcuMiwyOS45LDEyLjQsNDcsMTIuNmMtMzAuNS0yMi45LTQ2LjEtNTIuNi00NS41LTkwYzAuMy0xNy4yLDQuOS0zMy40LDE0LTQ4LjcgICBDOTMuMSwxNTkuMSwxNjQsMTk1LjcsMjUxLjMsMjAxLjhjLTAuNS0zLjgtMC44LTYuOC0xLjItOS45Yy03LjItNTUuNCwyOC44LTEwNS44LDgzLjgtMTE2LjNjMzQuNS02LjYsNjUsMi41LDkwLjgsMjYuMyAgIGM0LDMuNiw3LjQsNC40LDEyLjQsMy4xYzIwLjEtNS4xLDM5LjItMTIuNSw1Ny43LTIyLjVjLTcuMSwyMy40LTIxLjcsNDEtNDEuNSw1NS44YzQuNS0wLjgsOS4xLTEuNCwxMy42LTIuMyAgIGM0LjctMSw5LjQtMi4xLDE0LjEtMy40YzQuNS0xLjIsOC45LTIuNiwxMy4zLTQuMWM0LjUtMS41LDktMy4yLDE0LjMtNC4xYy0yLjYsMy42LTUuMSw3LjQtNy45LDEwLjljLTExLjYsMTQuNy0yNSwyNy42LTM5LjcsMzkuMSAgIGMtMS41LDEuMi0yLjgsMy44LTIuNyw1LjZjMC44LDM1LjUtNC4yLDcwLjEtMTUuNywxMDMuN2MtMjIuNiw2Ni4yLTYyLDExOS44LTEyMS4xLDE1OC4xYy0yOS4yLDE4LjktNjEuMSwzMS4zLTk1LjIsMzguNSAgIGMtMzMuOCw3LjEtNjcuOCw4LjQtMTAxLjksNC40Yy0zNC4yLTQtNjYuNy0xNC4xLTk3LjMtMjkuOWMtOC4xLTQuMS0xNS45LTguNy0yMy44LTEzLjFDMy42LDQ0MS4zLDMuOCw0NDAuOSw0LDQ0MC41eiIvPjwvZz48L3N2Zz4="/>
            </a>
          </div>
          <h2>🦁 Pinion on Web3!</h2>
          <p>
            "Pinions are your own!" - Web3<br/>
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

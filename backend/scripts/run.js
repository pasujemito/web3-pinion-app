
const main = async () => {

    // Init Contract
    const contractFactory = await hre.ethers.getContractFactory("PinionApp")
    const deployContract = await contractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.1")
    })
    await deployContract.deployed()
    console.log("Contract deployed to address:", deployContract.address)

    // Contract Balance
    let contractBalance = await hre.ethers.provider.getBalance(
        deployContract.address
    )
    console.log("Contract balance: ", hre.ethers.utils.formatEther(contractBalance))
    
    // Send Transaction
    const likeTxn = await deployContract.like("Pinion #1!")
    await likeTxn.wait()

    const likeTxn2 = await deployContract.like("Pinion #2!")
    await likeTxn2.wait()

    // Check New Contract Balance
    contractBalance = await hre.ethers.provider.getBalance(deployContract.address)
    console.log("Current Contract Balance: ", hre.ethers.utils.formatEther(contractBalance))
    

    newLikes = await deployContract.getTotalLikes()
    console.log("Total expressed pinions: ", newLikes.toNumber())

    allUsers = await deployContract.getAllUsers()
    console.log(allUsers)
}

const runMain = async () => {
    try {
        await main()
        process.exit(0)
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
}

runMain();
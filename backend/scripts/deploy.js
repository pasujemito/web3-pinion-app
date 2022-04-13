const fs = require('fs')
const path = require("path")

const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();

    console.log("Account Balance: ", accountBalance.toString());
    
    const contractFactory = await hre.ethers.getContractFactory("PinionApp");
    const deployContract = await contractFactory.deploy({
        value: hre.ethers.utils.parseEther("0.001")
    });
    await deployContract.deployed();
    console.log("Deployed contract with account: ", deployer.address);
}

const copyArtifacts = async () => {
    const backend_dir = path.resolve(__dirname, '..');
    const frontend_dir = path.resolve(__dirname, '../..');

    let src = backend_dir + "/artifacts/contracts"
    const dest = frontend_dir + "/frontend/src/utils"

    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
      !fs.existsSync(dest) && fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(folder => {
        src = src + '/' + folder
        fs.readdirSync(src).forEach(file => {
            !file.includes('dbg') && fs.copyFileSync(
                src + '/'+ file, 
                dest + '/'+ file
            )
        })

      });
    }
    console.log("Frontend ABI updated: ", deployer.address);

}

const runMain = async () => {
    try {
        await main()
        await copyArtifacts();
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

runMain();
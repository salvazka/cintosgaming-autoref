const fs = require("fs");
const puppeteer = require("puppeteer");
const { faker } = require("@faker-js/faker");
const { ethers } = require("ethers");
const readlineSync = require("readline-sync");

// Fungsi untuk menampilkan banner ASCII
const showBanner = () => {
    try {
        const banner = fs.readFileSync("banner.txt", "utf8");
        console.log(banner);
    } catch (err) {
        console.log("Banner tidak ditemukan, lanjutkan program...\n");
    }
};

// Tampilkan banner saat program dimulai
showBanner();

async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

const saveAccountToFile = (accountData) => {
    fs.appendFileSync("accounts.txt", accountData + "\n", "utf8");
};

const createAccounts = async (numAccounts, userCode) => {
    const browser = await puppeteer.launch({ headless: true });

    for (let i = 0; i < numAccounts; i++) {
        const page = await browser.newPage();

        // Generate data random
        const firstName = faker.person.firstName().toLowerCase();
        const lastName = faker.person.lastName().toLowerCase();
        const randomNum = Math.floor(Math.random() * 10000);
        const email = `${firstName}.${lastName}${randomNum}@mail.com`;

        // Generate Ethereum Address from Private Key
        const privateKey = ethers.Wallet.createRandom().privateKey;
        const wallet = new ethers.Wallet(privateKey);
        const ethAddress = wallet.address;

        console.log(`Mendaftar akun ke-${i + 1} dengan:`);
        console.log(`Nama: ${firstName} ${lastName}`);
        console.log(`Email: ${email}`);
        console.log(`ETH Address: ${ethAddress}`);
        console.log(`Private Key: ${privateKey}`);
        console.log(`Kode Reff: ${userCode}`);

        // Buka halaman signup
        await page.goto("https://waitlist-cintosgaming.com/signup", { waitUntil: "load" });

        // Isi input form dengan jeda 1 detik setiap input
        await page.type("#name", `${firstName} ${lastName}`);
        await delay(1000);
        
        await page.type("#email", email);
        await delay(1000);
        
        await page.type("#ethAddress", ethAddress);
        await delay(1000);
        
        await page.type("#userCode", userCode);
        await delay(1000);

        // Klik tombol daftar
        await Promise.all([
            page.click("#root > div.min-h-screen.flex.items-center.justify-center.bg-cover.bg-center.bg-no-repeat > div > form > button"),
            page.waitForNavigation({ waitUntil: "networkidle2" })
        ]);

        console.log("Pendaftaran berhasil!");

        // Simpan akun yang berhasil diregistrasi langsung ke dalam file
        const accountData = `Nama: ${firstName} ${lastName}\nEmail: ${email}\nETH Address: ${ethAddress}\nPrivate Key: ${privateKey}\nKode Reff: ${userCode}\n`;
        saveAccountToFile(accountData);

        await page.close();
    }

    console.log("Semua akun berhasil disimpan ke accounts.txt");
    await browser.close();
};

// Input jumlah akun dan kode referral
const jumlahAkun = parseInt(readlineSync.question("Masukkan jumlah akun yang ingin dibuat: "), 10);
const userCode = readlineSync.question("Masukkan kode referral: ");

createAccounts(jumlahAkun, userCode);

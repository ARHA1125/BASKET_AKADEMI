import * as crypto from 'crypto';

function generateAuthPayload(userID: string, passwordPlain: string) {
    // 1. Generate the Token (Format: yyyy-MM-dd'T'HH:mm:ss)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const token = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    // 2. Calculate the Security Code: MD5(token + MD5(Password))
    const passwordHash = crypto.createHash('md5').update(passwordPlain).digest('hex');
    const combinedString = token + passwordHash;
    const securityCode = crypto.createHash('md5').update(combinedString).digest('hex');

    // 3. Return the exact JSON structure required by the image
    return {
        token: token,
        securityCode: securityCode,
        language: 1,
        userID: userID,
        accessToken: ""
    };
}

// Generate your specific request body
const requestBody = generateAuthPayload("5XGWWJUK3M", "Darmaj4y4");

console.log(JSON.stringify(requestBody, null, 2));
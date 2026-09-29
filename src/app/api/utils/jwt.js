import jwt from "jsonwebtoken";
export function generateAccessToken(arg) {
    const expiresInDays = 30;
    const expirationTimeInSeconds = expiresInDays * 24 * 60 * 60;
    console.log(process.env.JWT_ACCESS_SECRET);
   
    const token = jwt.sign(arg, process.env.JWT_ACCESS_SECRET, { expiresIn: expirationTimeInSeconds  });
  
    return token;
}


export function decodeJwtAccessToken(token) {
    try {
        const response = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        return response;
    } catch (error) {
        return;
    }
}

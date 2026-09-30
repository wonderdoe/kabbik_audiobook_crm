import bcrypt from 'bcryptjs';

export function genSalt() {

    const salt = bcrypt.genSaltSync(10);

    return salt;

}

export function genHash(password) {

    const salt = genSalt();

    const hashPass = bcrypt.hashSync(password, salt);

    return hashPass;

}

export default function compareHash(password, hashPass) {

    const compare = bcrypt.compareSync(password, hashPass)

    return compare;
}



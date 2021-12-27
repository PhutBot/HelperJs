export const RandomStringFormat = {
    BINARY: '01',
    OCTAL: '01234567',
    NUMERIC: '0123456789',
    HEXADECIMAL: '0123456789abcdef',
    ALPHA: 'abcdefghijklmnopqrstuvwxyz',
    ALPHA_NUMERIC: 'abcdefghijklmnopqrstuvwxyz0123456789',
    BASE64: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/',
    BASE64_URL: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+_'
};
export function rFloat(beg, end) {
    const diff = end - beg;
    return Math.random() * diff + beg;
}
export function rInt(beg, end) {
    return Math.floor(rFloat(beg, end));
}
export function rString(length, format = RandomStringFormat.BASE64_URL) {
    const fmt = format in RandomStringFormat ? RandomStringFormat(format) : format;
    let result = '';
    for (let i = 0; i < length; ++i) {
        result += fmt.charAt(Math.floor(Math.random() * fmt.length));
    }
    return result;
}
//# sourceMappingURL=Rand.js.map
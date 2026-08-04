window.ble_rcu_input_render = (input) => {
    if (typeof input !== 'string') {
        throw new Error('输入必须为16进制字符串');
    }

    const hex = input.trim();
    if (hex.length % 2 !== 0) {
        throw new Error('输入长度必须为偶数（每2个字符=1字节）');
    }
    // 你当前需求：60位hex字符 = 30字节 = 240bit
    // 这里做成通用实现：bitCount 由输入字节数决定，不再硬编码 128
    if (!/^[0-9a-fA-F]*$/.test(hex)) {
        throw new Error('输入包含非法字符（仅允许0-9A-F）');
    }

    const byteCount = hex.length / 2;
    const bitCount = byteCount * 8;
    const result = {};

    // 按“字节顺序 + 每字节高位到低位”写入 bit，与旧实现保持一致
    let pos = 1; // 1-based
    for (let byteIdx = 0; byteIdx < byteCount; byteIdx++) {
        const byteHex = hex.slice(byteIdx * 2, byteIdx * 2 + 2);
        const value = Number.parseInt(byteHex, 16);

        // 依次取 bit7..bit0（MSB -> LSB）
        for (let bit = 7; bit >= 0; bit--) {
            const hexKey = pos.toString(16).padStart(2, '0').toUpperCase();
            result[hexKey] = ((value >> bit) & 1) ? '1' : '0';
            pos++;
        }
    }

    // 保险：确保输出位数与输入一致（比如空字符串时）
    for (; pos <= bitCount; pos++) {
        const hexKey = pos.toString(16).padStart(2, '0').toUpperCase();
        result[hexKey] = '0';
    }

    return result;
};
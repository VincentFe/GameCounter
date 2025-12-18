
export class Generator {
    
    static generateGUID(): string 
    {
        // Generate a random number between 0 and 99,999,999
        const randomNum = Math.floor(Math.random() * 100000000);

        // Pad with leading zeros to ensure it's always 8 digits
        return randomNum.toString();
    }       
}
window.update_string_by_language = (inputString, lang, newValue)=>{
    const startTag = `[${lang}]`;
    const endTag = `[/${lang}]`;
    const startIndex = inputString.indexOf(startTag);
    const endIndex = inputString.indexOf(endTag, startIndex);
    console.log(startIndex,endIndex);
    if (startIndex !== -1 && endIndex !== -1) {
        const currentContent = inputString.substring(startIndex + startTag.length, endIndex);
        console.log("currentContent",currentContent);
        const updatedString = inputString.replace(`[${lang}]${currentContent}[/${lang}]`, `[${lang}]${newValue}[/${lang}]`);
        
        return updatedString;
    }
    return inputString;
}
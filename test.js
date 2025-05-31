const email = 'sswcwecew'
const verificationCode = email ? Math.floor(1000 + Math.random() * 9000).toString() : null;

console.log(verificationCode)


const date = new Date()
const time = date.toLocaleTimeString()
const newdate = date.toDateString()
console.log("date",newdate)


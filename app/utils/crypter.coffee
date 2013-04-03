crypto = require 'crypto'
class Coder
    constructor:(@hash)->
    
    encrypt: (text) ->
        return unless text
        cipher = crypto.createCipher("aes-256-cbc", @hash)
        crypted = cipher.update(text, "utf8", "hex")
        crypted += cipher.final("hex")
        crypted
    
    decrypt: (text) ->
        return unless text
        decipher = crypto.createDecipher("aes-256-cbc", @hash)
        dec = decipher.update(text, "hex", "utf8")
        dec += decipher.final("utf8")
        dec
module.exports = (hash) -> new Coder(hash)

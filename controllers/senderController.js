const mongoose = require('mongoose');
const Sender = mongoose.model('Driver');

exports.getSenderBySlug = async ( req, res ) => {
  
  res.redirect('/account/sender')
}

exports.account =  async (req, res) => {
    
    const sender = await Sender.find();
    
    res.render('senderAccount', {
        title: 'Отправитель', 
        sender
    });
}

exports.updateAccount = async (req, res) => {
  console.log('update account');
  
}
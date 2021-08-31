const express = require('express');
const jwt = require('jsonwebtoken');
const Inmate = require('../models/Inmate');
const Block = require('../blockchain/block');
const Blockchain = require('../blockchain/blockchain');

const router = express.Router();
let jwtSecretKey = process.env.JWT_SECRET_KEY;

// Function to verify authentication token
const verifyJwtToken = (req, res, next) => {
    let authorizationHeader = req.headers.authorization;

    if(typeof authorizationHeader !== 'undefined'){
        const token = authorizationHeader.split(' ')[1];
        jwt.verify(token, jwtSecretKey, (error, authData) => {
            if(error){
                res.sendStatus(403);
            }else{
                next();
            }
        });
    }else{
        res.sendStatus(403);
    }
}

router.post('/create-genesis-block', verifyJwtToken, (req, res) => {

    const creator = req.body.creator;

    if(creator == process.env.CREATOR){

        const blockchain = new Blockchain();
        const genesisBlock = blockchain.getLastestBlock();
        
        const inmate = new Inmate({
            ...genesisBlock
        });

        inmate.save()
        .then(result => {
            res.status(200).json({
                inmate: result
            });
        })
        .catch(error => {
            res.status(500).json({
                error
            });
        });

    }else{
        res.status(403).json({
            message: 'Unauthorised genesis block creator'
        });
    }

});

module.exports = router;
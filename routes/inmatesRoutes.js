const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

router.get('/', verifyJwtToken, (req, res) => {
    //Get all employees from the database
    const inmate = Inmate.find();

    inmate.exec()
    .then(result => {
        res.status(200).json({
            inmates: result
        });
    })
    .catch(error => {
        res.status(500).json({
            error
        });
    });

});

router.get('/:hash', verifyJwtToken, (req, res) => {
    // Get inmate's ID
    const hash = req.params.hash;

    const inmate = Inmate.findOne({hash: hash});

    inmate.exec()
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

});

router.post('/', verifyJwtToken, (req, res) => {
    // Get new inmate's details
    const  { 
        firstName,
        middleName,
        lastName,
        gender,
        dob,
        phoneNumber,
        state,
        fatherName,
        motherName,
        fatherMotherAddress,
        brotherName,
        sisterName,
        brotherSisterAddress,
        caseNumber,
        caseReporter,
        caseDate,
        caseType,
        caseAddress,
        description
    } = req.body;

    const date  = (new Date()).toLocaleString();

    const data = {
        firstName,
        middleName,
        lastName,
        gender,
        dob,
        phoneNumber,
        state,
        fatherName,
        motherName,
        fatherMotherAddress,
        brotherName,
        sisterName,
        brotherSisterAddress,
        caseNumber,
        caseReporter,
        caseDate,
        caseType,
        caseAddress,
        description
    };

    // Get the current chain of records (blockchain)
    const inmates = Inmate.find();

    inmates.exec()
    .then(result => {

        const block = new Block(
            date, data
        );

        const blockchain = Blockchain.instanceFrom(result);
        blockchain.addBlock(block);
        const latestBlock = blockchain.getLastestBlock();

        const inmate = new Inmate({
            ...latestBlock
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
    })
    .catch(error => {
        res.status(500).json({
            error
        });
    });

});

module.exports = router;
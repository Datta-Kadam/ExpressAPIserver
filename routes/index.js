var express = require('express');
var router = express.Router();
var DualSimSetup=require('../models/dualSimSetup');
var Project=require('../models/project');
var convert = require('xml-js');
var deepEqual = require('deep-equal');

router.get('/hydrate', function(req, res, next) {   
  //USING MODEL GET THE APP THE RELEASES PRESENT IN DB 
  if(req.session.release!== undefined && req.session.project !== undefined){
    let dataToSend ={ release : req.session.release, project: req.session.project}
    res.json(dataToSend);
  } 
  console.log(req.session.release,req.session.project,req.session);
  res.json(req.session);
});


router.get('/release', function(req, res, next) {   
  //USING MODEL GET THE APP THE RELEASES PRESENT IN DB 
  if(req.session.release !== undefined){
    res.json(req.session.release);
  } else {
    DualSimSetup.find({},{'release':1,_id:0}, function(err, releases){
      if(err) return next(err);
      const rel=[];
      releases.forEach(function(release) { 
        //console.log('Release data',release.release,releases)    
        rel.push(release.release);
      });
      req.session.release={release:rel};
      res.json({release:rel});
     // console.log(releases);
    });
  }
  
});

router.get('/project/:rel', function(req, res, next) { 
 if(req.session.project !== undefined){
    res.json(req.session.project);
 } else {
    DualSimSetup.find({ "projectName": { "$regex": req.params.rel, "$options": "i" } },  function(err, releases){
      if(err) return next(err);
    // console.log(releases);
      const rel=[];
      releases.forEach(function(release) { 
      // console.log('Release data',release.projectName,releases)    
        rel.push(release.projectName);
      });
      req.session.project={project:rel};
      res.json({project:rel});
    // console.log(releases);
    });
 }
 
 // res.json({project:['1707_project1','1707_project2','1707_project3','1707_project4']});
});

router.get('/api/:project', function(req, res, next) { 
  //connec to backend mongo db 
 // res.json({api:['1707_project1_api1','1707_project2_api2','1707_project3_api3','1707_project4_api4']});
    DualSimSetup.find({ "projectName": req.params.project },{'apiList':1,_id:0},  function(err, releases){
        if(err) return next(err);
      //  console.log(releases);
        console.log(releases[0].apiList);
        const rel=[];
        releases[0].apiList.forEach(function(release) { 
        // console.log('Release data',release.projectName,releases)    
          rel.push(release);
        });
        res.json({api:rel});
      // console.log(releases);
      });
});


router.get('/reqrespair/:release/:project/:api', function(req, res, next) { 
  //connec to backend mongo db 
    var apiname=req.params.api;
    console.log('Here we go ',req.params.release,req.params.project,req.params.api);
 // res.json({api:['1707_project1_api1','1707_project2_api2','1707_project3_api3','1707_project4_api4']});
    DualSimSetup.find({ "release":req.params.release,"projectName":req.params.project },{'api':1,_id:0}, function(err, releases){
        if(err) return next(err);      
         res.json({request:releases[0].api[0].request,response:releases[0].api[1].response});
      });
});

router.post('/simulate', function(req, res, next) { 
  //convert request/response to json object
  var incomingRequest = convert.xml2json(req.body.request, {compact: false});
  var incomingResponse = convert.xml2json(req.body.response, {compact: false});    
  //  console.log("IncomingRequest",incomingRequest);
  //  console.log("IncomingRequest",incomingResponse);
  function checkDeepEquality(allrequests){ 
   
    var result={index : -1, match:true};
      for(i=0;i<allrequests.length;i++){            
        if(deepEqual(allrequests[i].request,incomingRequest)){
          return result= {index : i, match:true};
        }else{
           result={index : i,match:false};
        }
      }   
      console.log("result",result);
      return result;
  }
  //ADD NEW REQUEST BASED ON THE INPUT VALUES FOR COMPARISION ELSE RETURN TRU IF REQUEST MATCHES
  //CHECK IF REQUESTS DOES EXISTS IN DB
   Project.find({ "apiName": req.body.apiName}, {'request':1,_id:0}, function(err, allrequests){
      if(err) return next(err);     
     // console.log('checkDeepEquality RESULT==>',checkDeepEquality(allrequests));     
   // if((!checkDeepEquality(allrequests).match) && (checkDeepEquality(allrequests).index)){
    console.log('checking usual here we go',checkDeepEquality(allrequests));

    if((!checkDeepEquality(allrequests).match) && (checkDeepEquality(allrequests).index)){
      //IF MATCH IS NOT FOUND FOR THE REQUEST THEN ADD NEW ENTRY
            const newRequest= {
              projectName:req.body.projectName,
              apiName:req.body.apiName,
              request: incomingRequest,
              response:incomingResponse,
              userId:req.body.userId
            }          
            let newEntry = new Project(newRequest);  
              newEntry.save((err, singleRequest) => {  
                if (err) {
                    res.status(500).send(err);
                }
                res.status(200).send(singleRequest);
            });
    }else{
      res.json({matching:true});
    }     
 }); 
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

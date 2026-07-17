const jwt = require("jsonwebtoken");


const SECRET = "CHAT_YEMEN_SECRET";


module.exports = function(req,res,next){


const token =
req.headers.authorization
?.split(" ")[1];



if(!token){

return res.status(401).json({

error:"لا يوجد تسجيل دخول"

});

}



try{


const user =
jwt.verify(
token,
SECRET
);



req.user=user;


next();



}
catch(error){


return res.status(401).json({

error:"التوكن غير صالح"

});


}



};
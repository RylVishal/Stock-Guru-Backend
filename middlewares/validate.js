
const validate = (schema)=>{
    return (req,res,next)=>{
        try{
            const result = schema.parse(req.body);
            req.body = result;
            next();
        }
        catch(err){
            return res.status(400).json({
                success:false,
                errors:err
            });
        }
    };
};

module.exports = validate;



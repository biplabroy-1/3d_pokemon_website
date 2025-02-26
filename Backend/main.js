// backend main 
const express = require('express');
const app = express();
const port = 5000;
const registerRoute = require('./routes/register');

app.use('/register', registerRoute);

app.get('/', (req, resp)=>{
    resp.render();
})



app.listen(port, ()=>{
    console.log(`Server is running at ${port}`);
});
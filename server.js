
const express = require("express");
const app = express();
const cors = require("cors");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database("./gallery.db", (error) => {
    if (error) return console.error(error.message);
    console.log("Connected to the in-memory SQlite database.");
});
app.use(express.json());
app.use(cors());


db.run (`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER,
    author VARCHAR(1023),
    alt VARCHAR(1023),
    tags VARCHAR(1023),
    image VARCHAR(1023),
    description VARCHAR(1023),
    PRIMARY KEY (id)
    )`);

// db.close((error) => {
//     if (error) {return console.error(error.message);}
//     console.log("close the database connection.");
// });

router.get("/", function (req, res) {
    
    db.all(`SELECT * FROM gallery`,[],(err,rows) => {
        if (err) {
            console.log(err.message); 
            req.status(500).json({"Error": "code 500, server error occurred."});
            return;
        }
        res.status(200).json(rows);
    });    
});

router.get("/:id", function (req, res) {
    if (req.params.id == "reset") {
        db.run(`DELETE FROM gallery`, function(err) {
            if (err) {
                console.log(err.message);
                res.status(500);
                res.json({"Error": "code 500, server error occurred."});
                return;
            }
            res.sendStatus(204);
        });
        return;
    }
    db.all(`SELECT * FROM gallery WHERE id=` + req.params.id, [], (err,rows) => {
        if (err) {
            console.log(err); 
            res.status(500).json({"Error": "code 500, server error occurred."});
            return;
        }
        if(rows.length == 0) {
            console.log("Not found.");
            res.status(404).json({"Error": "code 404, element not found."});
            return;
        }
        console.log(rows);
        res.status(200).json(rows);
    });
});


router.post("/", function (req,res) {

    let array = ["author", "alt", "tags", "image", "description"];

    if (req.body.author == null || req.body.alt == null || req.body.tags == null || req.body.image == null || req.body.description == null) {
        console.log("Request incomplete.");
        for (elem of array) {
            if(req.body[elem] == null) {
                res.status(400).json({"Error": "code 400, bad request. " +  elem + " missing"});
                return;
            }
        }        
    }

    for (elem of array) {
        if(req.body[elem].length > 1024) {
            res.status(400).json({"Error": "code 400, bad request. " +  elem + " string too long"});
            return;
        }
    }        


    db.run(`INSERT INTO gallery (author, alt, tags, image, description)
    VALUES (?,?,?,?,?)`,
    [req.body.author, req.body.alt, req.body.tags, req.body.image, req.body.description],
    function (err) {
        if(err) {
            console.log(err.message);
            res.status(500).json({"Error": "code 500, server error occurred."});
            return;
        }
        res.sendStatus(201);
        console.log("row succesfully inserted.");
    }
    )
});

router.put("/:id", function (req,res) {
    console.log("MEOW");
    let array = ["author", "alt", "tags", "image", "description"];

    if (req.body.author == null || req.body.alt == null || req.body.tags == null || req.body.image == null || req.body.description == null || req.params.id == "") {
        console.log("Request incomplete.");
        for (elem of array) {
            if(req.body[elem] == null) {
                res.status(400).json({"Error": "code 400, bad request. " +  elem + " missing"});
                return;
            }
        }        
    }

    for (elem of array) {
        if(req.body[elem].length >= 1024) {
            res.status(400).json({"Error": "code 400, bad request. " +  elem + " string too long"});
            return;
        }
    }        


    db.run(`UPDATE gallery SET author=?, alt=?, tags=?, image=?, description=? WHERE id=?`,
    [req.body.author, req.body.alt, req.body.tags, req.body.image, req.body.description, req.params.id],
    function(err) {
        if(err) {
            console.log(err.message);
            res.status(500).json({"Error": "code 500, server error occurred."});
            return;
        }
        if (this.changes == 0) {
            console.log("   Not found.");
            res.status(404).json({"Error": "code 404, element not found."});
            return;
        }
        res.sendStatus(204);
        console.log("row succesfully updated.");
    })
});

router.delete("/:id", function (req,res) {
    if (req.params.id == "") {
        console.log("Bad request.");
        res.status(400).json({"Error": "code 400, bad request: id not specified."})
        return;
    }
    db.run(`DELETE FROM gallery where id=` + req.params.id, function (err) {
        if (err) {
            console.log(err.message);
            res.status(500).send();
            return;
        }
        if (this.changes == 0) {
            console.log("Not found.");
            res.status(404).json({"Error": "code 404, element not found."});
            return;
        }
        res.sendStatus(204);
    })
});

router.all("/*", function (req,res) {
    res.status(400).json({"Error": "Non existing route."})
});

const errorHandler = function (err, req, res, next) {
    if (err) {
        res.status(400).json({"Error": "Bad request. Not a valid Json file."});
        return;
    }
    next();
}


app.use("/api", router);
app.use(errorHandler);
app.listen(3000);


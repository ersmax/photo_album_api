
window.addEventListener("DOMContentLoaded", DOMLoaded)

let authorsNavArray = [];
let searchKeysArray = [];
fetch("http://localhost:3000/api").then(getImages);

async function getImages(response){
    authorsNavArray = [];
    authorsNav.innerHTML = "";
    if (response.status === 200){
        console.log(response.status);
        var jsonString = await response.text();
        console.log(jsonString);
        gallery = JSON.parse(jsonString);
        console.log(gallery);
        galleryRefresh();
    }
}

function changeColor (event) {
    document.body.style.backgroundColor = event.target.value;
}


function DOMLoaded() {
    modal = document.getElementById("formModal");
    bar = document.getElementById("bar");
    searchBar = document.getElementById("searchBar");
    searchKeysDiv = document.getElementById("searchKeysDiv");
    gallerySec = document.getElementById("gallerySec");
    barPos = bar.offsetTop;
    document.getElementById("idDiv").style.display = "none";
    document.getElementById("submitButton").addEventListener("click", submitForm);
    document.getElementById("modalButton").addEventListener("click",  displayModal);
    document.getElementById("id").addEventListener("keyup", idUpdate);
    document.getElementById("formReset").addEventListener("click", clearForm);
    document.getElementById("resetButton").addEventListener("click", async function() {await fetch("http://localhost:3000/api/reset"); fetch("http://localhost:3000/api").then(getImages);})
    document.getElementById("updateButton").addEventListener("click", displayModal);
    document.getElementById("closeButton").addEventListener("click", hideModal);
    document.getElementById("searchBar").addEventListener("keyup", searchUpdate);
    document.getElementById("colorPicker").addEventListener("change", changeColor);
    window.addEventListener("scroll", stickySearch);
    window.addEventListener("resize", function(){barPos = bar.offsetTop;});
    window.addEventListener("keyup", hideModal);
}

function stickySearch() {
    if (window.pageYOffset >= barPos) {
      bar.classList.add("sticky")
    } else {
      bar.classList.remove("sticky");
    }
}

function idUpdate(event) {
    let form = document.getElementById("contributionForm");
    for (image of gallery) {
        if (image.id == form.id.value) {
            form.author.value = image.author;
            form.image.value = image.image;
            form.tags.value = image.tags;
            form.alt.value = image.alt;
            form.description.value = image.description;  
            return;
        }
    }
}

function searchUpdate (event) {
    if (event.code == "Enter") {addSearchKey();};
    galleryRefresh();
}

function addSearchKey () {
    let key = searchBar.value.toLowerCase().trim();
    if (searchKeysArray.indexOf(key) === -1) {
        searchKeysArray.push(key);
        let keyDiv = document.createElement("div");
        keyDiv.classList.add("keyDiv");
        keyDiv.id = key;
        keyDiv.innerHTML = `${key} &times;`;
        searchKeysDiv.appendChild(keyDiv);
        keyDiv.addEventListener("click", removeSearchKey);
    }
    searchBar.value = "";
}

function addSearchKeyFromNav(event) {
    let key = event.target.textContent;
    if (searchKeysArray.indexOf(key) == -1) {
        searchKeysArray.push(key);
        let keyDiv = document.createElement("div");
        keyDiv.classList.add("keyDiv");
        keyDiv.id = key;
        keyDiv.innerHTML = `${key} &times;`;
        searchKeysDiv.appendChild(keyDiv);
        keyDiv.addEventListener("click", removeSearchKey);
    }
    else {
        searchKeysArray.splice(searchKeysArray.indexOf(key), 1);
        searchKeysDiv.removeChild(document.getElementById(key));
    }
    galleryRefresh();
}

function removeSearchKey(event) {
    searchKeysArray.splice(searchKeysArray.indexOf(event.target.id), 1);
    searchKeysDiv.removeChild(event.target);
    galleryRefresh();
}

function displayModal(event) {
    if (event.currentTarget.id == "updateButton") {
       document.getElementById("idDiv").style.display = "flex";
       document.getElementById("id").focus();
    }
    modal.style.display = "block";
}
function hideModal(event) {
    if (modal.style.display == "block") {
        if (event.target == document.getElementById("closeButton")){
            modal.style.display = "none";
            if (document.getElementById("idDiv").style.display == "flex") document.getElementById("idDiv").style.display = "none";
        }
        else if (event.code == "Escape"){
            modal.style.display = "none";
            if (document.getElementById("idDiv").style.display == "flex") document.getElementById("idDiv").style.display = "none";
        }
    }
}

function galleryRefresh() {
    document.getElementById("gallerySec").textContent = "";
    imgDiv = null;

    for (currImage of gallery) {
        if (authorsNavArray.indexOf(currImage.author) == -1) {
           authorsNavArray.push(currImage.author);
        }
        if (searchKeysArray.length == 0 && searchBar.value == "") {
            imgDiv = document.createElement("div");
            
        }
        else {checkSearchKeys(currImage)}
        if (imgDiv !== null) {
            imgDiv.classList.add("imgDiv");
            imgDiv.innerHTML = `<figure><img src=" ${currImage.image}" alt="${currImage.alt}"></figure>
                                <p>${currImage.author}</p>
                                <div class="description"> ${currImage.description} </div>
                                <strong>ID: </strong><span>${currImage.id}</span><span class="edit">&#9998;</span><span class="trash">&#128465;<span>`;
            imgDiv.addEventListener("click", toggleDescription);
            gallerySec.appendChild(imgDiv);
            imgDiv = null;
        }

    }
    authorsNav = document.getElementById("authorsNav");
    authorsNav.innerHTML = "";
    for (author of authorsNavArray) {
        authorDiv = document.createElement("div");
        authorDiv.classList.add("authorDiv");
        authorDiv.textContent = author;
        authorsNav.appendChild(authorDiv);
        authorDiv.addEventListener("click", addSearchKeyFromNav)
    }
    
}

function toggleDescription(event) {
    let currImgDiv = event.currentTarget;
    currImgDiv.classList.toggle("divExpand");
    currImgDiv.children[5].addEventListener("click", idModify);
    currImgDiv.children[6].addEventListener("click", submitForm);
    setTimeout(currImgDiv.children[2].classList.toggle("desDisplay"),1500);
}

function idModify (event) {
    displayModal({currentTarget:{"id": "updateButton"}});
    document.getElementById("id").value =  event.target.parentNode.children[4].textContent;
    idUpdate();
}




function checkSearchKeys (currImage) {
    console.log("");
    let validKey = (searchKeysArray.length == 0) ? true : false; 
    let validBar = (searchBar.value == "") ? true : false;
    for (currData of Object.values(currImage)) {
        console.log(currData.toString().toLowerCase().trim());
        console.log(searchBar.value.trim().toLowerCase());

        if(!validKey) {          
            for (key of searchKeysArray) {
                
                if (currData.toString().toLowerCase().includes(key.toLowerCase())) validKey = true;
            }
        }

        if (!validBar && currData.toString().toLowerCase().includes(searchBar.value.trim().toLowerCase())) validBar = true;

        if (validBar && validKey) {
            imgDiv = document.createElement("div");
            return;
        }
    }
}

async function submitForm(event) {
    event.preventDefault();
    let form = document.getElementById("contributionForm");
    if (document.getElementById("idDiv").style.display == "flex" && form.id.value == "") {
        window.alert("ID required");
        return;
    }
    
    if (form.author.value == "" || form.image.value == "" || form.tags.value == "" || form.alt.value == "" || form.description.value == "") {
        if (document.getElementById("formModal").style.display == "block") {
            window.alert("form incomplete"); 
            return;
        }
    }
    

    let newImage = {
        "author": form.author.value,
        "alt": form.alt.value,
        "tags": form.tags.value,
        "image": form.image.value,
        "description": form.description.value,
    };
    if (document.getElementById("idDiv").style.display == "none" && event.target.id == "submitButton") {
        await fetch("http://localhost:3000/api",{
            method : "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newImage)
        })
        fetch("http://localhost:3000/api").then(getImages);
    }
    else if (document.getElementById("idDiv").style.display == "flex") {
        await fetch("http://localhost:3000/api/" + form.id.value,{
            method : "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newImage)
        })
        fetch("http://localhost:3000/api").then(getImages);
    }
    else {
        await fetch(`http://localhost:3000/api/${event.target.parentNode.children[4].textContent}`,{
            method : "DELETE",
            headers: {"Content-Type": "application/json"},
        })
        fetch("http://localhost:3000/api").then(getImages);
    }
    hideModal({"code": "Escape"});
    form.reset();
}


function clearForm () {
    document.getElementById("contributionForm").reset();
    
}


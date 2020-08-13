
//Select Elements
const addNewContactBtn = $("#cmsAddNewEntry");
const backDrop = $("#backdrop");
const newPersonModal = $("#newPersonModal");
const cancelBtnModal = $("#newPersonCancelBtn");
const submitBtnModal = $("#newPersonSubmitBtn");
const updateBtnModal = $("#newPersonUpdateBtn");
const nameInput = $("#newPersonName");
const addressInput = $("#newPersonAddress");
const phoneInput = $("#newPersonPhone");
const list = $("#myContactList");
const clearBtn = $("#clearBtn");

// database name
const DB_NAME = "contactlist-db7";

//class Names
const disableModal = "disable-modal";
const disableUpdateBtn = "disable-update-btn";
const disableSubmitBtn = "disable-submit-btn";


//variables
var PERSONS = [];
var id = 0;
var db,
    objectStore,
    index,
    tx;

// CREATE DATABASE
var request = window.indexedDB.open(DB_NAME, 1);

request.onerror = function (event) {
    console.log('The database is opened failed');
  };

request.onupgradeneeded = function (event) {
let db = event.target.result;
if (!db.objectStoreNames.contains('contact')) {
    objectStore = db.createObjectStore('contact', { keyPath: 'id' });
    index = objectStore.createIndex('name', 'name', { unique: false });
    console.log("index Created Successfully");
}}

request.onsuccess = function (event) {
    db = request.result;
    console.log('The database is opened successfully');
    console.log(db);
    readAll();
};

//add or update into the database
function update(contact) {
    let request = db.transaction(['contact'], 'readwrite')
        .objectStore('contact')
        .put(contact);
        console.log (contact);
    
    request.onsuccess = function (event) {
        console.log('The data has been updated successfully');
    };
    
    request.onerror = function (event) {
        console.log('The data has been updated failed');
    }
}

// read all items in database using cursor
function readAll() {
    var objectStore = db.transaction('contact').objectStore('contact');
    PERSONS = [];
        objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {  
            loadList (cursor.value.name, cursor.key, cursor.value.phone, cursor.value.address, cursor.value.trash);     
            addToTheList (cursor.value.name, cursor.key, cursor.value.phone, cursor.value.address, cursor.value.trash);
            id++; 
            cursor.continue();
        } else {
        console.log('No more data');
        }
    };
}

//load LIST array from entries in the database
function  loadList (name, id, phone, address, trash){
    let contact = {
    name    : name,
    id      : id,
    phone   : phone,
    address :address,
    trash   : trash
    }; 
    PERSONS.push (contact);
}

function addToTheList(newName, id, newPhone, newAddress, trash){
    if (trash){
        return;
    }
    const item = `<li class = "cms-table-row">
                    <div class = "cms-table-column cms-name">${newName}</div>
                    <div class = "cms-table-column cms-phone">${newPhone}</div>
                    <div class = "cms-table-column cms-address ">${newAddress}</div>
                    <div class = "cms-table-column cms-edit-entry-column" job="edit" id="${id}">Edit</div>
                    <div class = "cms-table-column cms-delete-entry-column" job="delete" id="${id}">X</div>
                  </li>
                `;
    console.log(item);
    list.append (item);
}



// On click handler for add new Contact Btn
addNewContactBtn.on ('click', function(){
    clearModal();
    toggleModal();
});

// on click Handler for Cancel Btn
cancelBtnModal.on('click',function(){
    clearModal();
    if (!updateBtnModal.hasClass(disableUpdateBtn)){
        toggleUpdateBtn();
        toggleSubmitBtn();
    }
    $((function () {updateBtnModal.off("click")}));
    toggleModal();
});

// on click handler for Submit Btn
submitBtnModal.on('click', function(){
    let newName = nameInput.val();
    let newAddress = addressInput.val();
    let newPhone = phoneInput.val();

    if (isEmptyField(newName, newAddress, newPhone) || isInvalidPhone(newPhone)){
        return;
    }
   
  
    addToListArray(newName, newAddress, newPhone, false);
    addToTheListElement(newName, newAddress, newPhone, false);
    clearModal();
    toggleModal();
    id++;
   
});

function isEmptyField(newName, newAddress, newPhone){
    if (newName == "" || newAddress == "" || newPhone == "") {
        alert ("Enter a Valid Contact");
        return true;
    }
    return false;
}


function isInvalidPhone(newPhone){
    intRegex = /[0-9 -()+]+$/;
    if((newPhone.length < 6) || (!intRegex.test(newPhone))) {
        alert('Please enter a valid phone number.');
        return true;
    }
}

function toggleModal(){
    backDrop.toggleClass(disableModal);
    newPersonModal.toggleClass(disableModal);
}
function clearModal() {
    nameInput.val("");
    addressInput.val("");
    phoneInput.val("");
}

// add new contact to Persons List
function addToListArray(name, address, phone, trash){
    let newPerson =
     {"id"     : id,
      "name"   : name,
      "phone"  : phone,
      "address": address,
      "trash"  : trash
    }
    PERSONS.push(newPerson);
    update (newPerson);
    
}

function addToTheListElement(newName, newAddress, newPhone, trash){
    if (trash){
        return;
    }
    const item = `<li class = "cms-table-row">
                    <div class = "cms-table-column cms-name">${newName}</div>
                    <div class = "cms-table-column cms-phone">${newPhone}</div>
                    <div class = "cms-table-column cms-address ">${newAddress}</div>
                    <div class = "cms-table-column cms-edit-entry-column" job="edit" id="${id}">Edit</div>
                    <div class = "cms-table-column cms-delete-entry-column" job="delete" id="${id}">X</div>
                  </li>
                `;
    console.log(item);
    list.append (item);
}

// listener on uonorderded list for edit and delete
list.on("click", function (event){
    const element =  event.target;
    const elementJob = element.attributes.job.value;
    if (elementJob == 'delete'){
        removeContact(element);
    }
    else if (elementJob == 'edit'){
        editContact(element);

    }
});

// Remove a contact
function  removeContact(element) {
    element.parentNode.parentNode.removeChild(element.parentNode);
    PERSONS[element.id].trash = true;
    update(PERSONS[element.id]);
}


// edit Contact 
function editContact (element) {

    preloadModal(element);  
    toggleUpdateBtn();
    toggleSubmitBtn();
    toggleModal();

    const parent =  element.parentNode;
    const children =  parent.children;


    // on click handler for Update Btn
    updateBtnModal.on('click', function(){
        let idOfElement = parseInt(children[3].id);
        let name = nameInput.val();
        let phone = phoneInput.val();
        let address = addressInput.val();
         // updating the UI
        updateListElement(children, name, phone, address)
         // update the array;
        updateListArray (idOfElement, name, phone, address, false);  
        let updatedContact = {
            "id"     : idOfElement,
            "name"   : name,
            "phone"  : phone,
            "address": address,
            "trash"  : false
        };
        //update the database
        update(updatedContact);

        toggleModal();
        toggleUpdateBtn();
        toggleSubmitBtn();
        $((function () {updateBtnModal.off("click")}));
    });
}

// function updateContact(children){

//     let idOfElement = parseInt(children[3].id);
//     let name = nameInput.val();
//     let phone = phoneInput.val();
//     let address = addressInput.val();
//      // updating the UI
//     updateListElement(children, name, phone, address)
//      // update the array;
//     updateListArray (idOfElement, name, phone, address, false);  
//     let updatedContact = {
//         "id"     : idOfElement,
//         "name"   : name,
//         "phone"  : phone,
//         "address": address,
//         "trash"  : false
//     };
//     //update the database
//     update(updatedContact);

//     toggleModal();
//     toggleUpdateBtn();
//     toggleSubmitBtn();
//     $((function () {updateBtnModal.off("click")}));


// }

function preloadModal(element){
    const parent =  element.parentNode;
    const children =  parent.children;
    //children[0] is the name cell
    nameInput.val(children[0].innerText);
    //children[1] is the phone cell
    phoneInput.val(children[1].innerText);
    //children[2] is the address cell
    addressInput.val(children[2].innerText);
}

function updateListElement (children, name, phone, address) {
    children[0].innerText = name;
    children[1].innerText = phone;
    children[2].innerText = address;
}

function updateListArray (id, name, phone, address, trash) {
    PERSONS[id].name = name;
    PERSONS[id].phone = phone;
    PERSONS[id].address = address;
    PERSONS[id].trash = trash;
}

function toggleUpdateBtn () {
    updateBtnModal.toggleClass(disableUpdateBtn);
    
}
function toggleSubmitBtn(){
    submitBtnModal.toggleClass(disableSubmitBtn);
}

// search functionality
$(document).ready(function(){
    $("#searchField").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#myContactList li").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });


//clear the database
clearBtn.on ("click" , function(){
if (db.objectStoreNames.contains('contact')){
    var transaction = db.transaction(["contact"],"readwrite");
    var objectStore = transaction.objectStore("contact");
    var objectStoreRequest = objectStore.clear();
    objectStoreRequest.onsuccess =function () {
    location.reload();
    };
}
});
















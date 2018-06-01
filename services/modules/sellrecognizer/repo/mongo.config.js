
var config = {
    url: 'mongodb://localhost:27017/SellRecognizer',
    dbname: "SellRecognizer",
    collections: {
        categories: "Categories",
        items: "Items",
        users: "Users",
        projects: "Projects",
        projecttypes:"ProjectType",
        stores:'Stores'
    }
};
module.exports = config;


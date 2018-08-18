
var config = {
    url: 'mongodb://localhost:27017/SellRecognizer',
    dbname: "SellRecognizer",
    collections: {
        categories: "Categories",
        items: "Items",
        users: "Users",
        projects: "Projects",
        projecttypes:"ProjectType",
        stores:'Stores',
        manifactory: 'Manifactory',
        materials: 'Materials'
    }
};
module.exports = config;


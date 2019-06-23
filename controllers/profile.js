module.exports = {
    index: function(req, res) {
        res.render('profile/index');
    },
    submit: function(req, res){
        res.render('profile/submitProjects')
    }
}
module.exports = {
    index: function(req, res) {
        res.render('profile/index');
    },






    
    submit: function(req, res){
        res.render('profile/submitProjects')
    },












    submitProject: function(req, res){
        title = req.body.title
        content = req.body.content
        
        datePosted = new Date()
        views = 0
        likes = 0
        res.redirect('/profile/submit');
    }
}
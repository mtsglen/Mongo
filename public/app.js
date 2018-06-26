$("#scrape").on("click", function() {
  // $.get("/scrape", function(data) {

    $("#articles").empty();
    // function scraperesult () {
      $.getJSON("/articles", data => {
        for (var i = 0; i < data.length; i++) {
          let articleCont = "<div class='article-container' data-id=" + data[i]._id + ">"
          let articlediv = "<div class='articlediv' data-id=" + data[i]._id + ">";
          let newTitle = "<h4 id='artTitle'>" + data[i].title + "</h2>";
          let newArtLink = "<a href='" + data[i].link + "'target='blank'>Click Here for story link</a>";
          let noteButton = "<button id='notesbtn' data-id=" + data[i]._id + " class='btn btn-secondary'>Click For Notes</button>";

          let articleTotal = (articleCont + articlediv + newTitle + "\n" + newArtLink + "\n" + noteButton + "\n")

          $("#articles").append(articleTotal);
        }
      })
    // }
    // scraperesult ();
  })
// });




$(document).on("click", "#notesbtn", function() {
  // $("#notes").empty();
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: `/articles/` + thisId
  })
    .then(function(data) {
      console.log(data);
      $("#notes").append("<h2>" + data.title + "</h2>");
      // $("#notes").append("<input id='titleinput' name='title' >");
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      $("#notes").append("<button data-id='" + data.note._id + "' id='deletenote'>Delete Note</button>");

      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});

$(document).on("click", "#savenote", function() {
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    
    .then(function(data) {
      
      console.log(data);
      
      $("#notes").empty();
    });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#deletenote", function () {
  let parentSelect = $(this).parent();
  let selected = $(this).attr("data-id");

  $.ajax({
    type: "DELETE",
    url: "/notes/" + selected,
    
    success: function(response) {
    
      $("#titleinput").val("");
      $("#bodyinput").val("");
      $("#action-button").html("<button id='make-new'>Submit</button>");
    }
    
  });

})

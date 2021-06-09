function showDiv() {
    document.getElementById('hiddenDiv').style.display = "block";
}

// $(document).ready(function(){
//     $("#myTab a").click(function(e){
//         e.preventDefault();
//         $(this).tab('show');
//     });
// });

$(function () {
    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function (start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });
});
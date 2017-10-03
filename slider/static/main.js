$(document).ready(function(){
	var minute_element =  document.getElementById('minutes');
	var hour_element = document.getElementById('hours');
	add_options(minute_element,60);
	add_options(hour_element,24);
	$('#playback_live :input').change(function(){
        $('.playback-show').toggle();
        document.getElementById("hours").value = 0;
  		document.getElementById("minutes").value = 0;
    });
});

function add_options(element,value){
	for(var i=0;i<value;i++){
		element.options[i] = new Option(i,i);
	}
}

var today = new Date();
document.getElementById('date2').innerHTML = (today.getDate() +"/" + today.getMonth() + "/" + today.getFullYear());
today.setDate(today.getDate() - 1);
document.getElementById('date1').innerHTML = (today.getDate() +"/" + today.getMonth() + "/" + today.getFullYear());
today.setDate(today.getDate() - 1);
document.getElementById('date0').innerHTML = (today.getDate() +"/" + today.getMonth() + "/" + today.getFullYear());

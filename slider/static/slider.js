var socket = io.connect('http://192.168.100.89:3000' , {reconnection: true,reconnectionDelay: 1000});

/*socket.on('disconnect',function(){
    socket = io.connect('http://192.168.100.89:3000');
});*/

var slider = document.getElementById('test-slider');
  noUiSlider.create(slider, {
   start: [0],
   connect: [true,false],
   /*step: 1,*/
   tooltips: true,
   behaviour:'tap',
   orientation: 'horizontal', // 'horizontal' or 'vertical'
   range: {
     'min': 0,
     '12.5%':10800,
     '25%':21600,
     '37.5':32400,
     '50%':43200,
     '62.5':54000,
     '75%':64800,
     '87.5':75600,
     'max': 86400,
   },
   format: wNumb({
     decimals: 0
   }),
   /*pips: { // Show a scale with the slider
    mode: 'range',
    density:8,
  }*/
  });

slider.noUiSlider.on('update', function( values, handle ) {
  value = values[0];
  formatting(value);
  console.log('here in slider change');
  sendToSocket();
  /*Slider color using manual technique*/
  /*var slider_element = document.getElementsByClassName('noUi-handle')[0];
  var left_align = slider_element.getAttribute('aria-valuenow');
  left_align = parseFloat(left_align);
  
  var slider_after = document.getElementsByClassName('noUi-origin')[0];
  var computed_width = 100 - left_align;
  console.log(computed_width);
  slider_after.setAttribute('style','background:blue;height:100%;width:'+computed_width+"%");*/
});

var min_slider_value = 0; //fetch it for later use
var max_slider_value = 86400; //fetch it for later use

function button_press(){
  var perc_diff = (1000/max_slider_value).toFixed(4); // 1 step is 10 unit equals to  10*100/300 percentage
  var value = document.getElementsByClassName("noUi-handle")[0];
  value1 = parseInt(value.getAttribute('aria-valuetext'));
  return value1;
}

function back(){
  var value2 = button_press(); 
  value2 = (value2 - 10) > 0 ? (value2 - 10) : 0;
  slider.noUiSlider.set([value2]);
}

function ahead(){
  var value2 = button_press(); 
  value2 = (value2 + 10) < max_slider_value ? (value2 + 10) : max_slider_value;
  slider.noUiSlider.set([value2]); 
}

function formatting(value){
  var seconds = parseInt(value%60);
  var minutes = parseInt(value/60);
  var hours = parseInt(minutes/60);
  minutes = minutes%60;
  var hour_str , min_str , sec_str;
  if(hours < 10){
    hours = "0" + hours;
  }
  if(minutes < 10){
    minutes = "0" + minutes;
  }
  if(seconds < 10){
    seconds = "0" + seconds;
  }
  var time_str = hours + ":" + minutes + ":" + seconds;
  var tooltip_value = document.getElementsByClassName('noUi-tooltip');
  tooltip_value[0].innerHTML=time_str;
}

function changeHours(obj){
  var minute_value = parseInt(document.getElementById("minutes").value);
  var value =  parseInt(obj.value);
  value = value*60*60 + minute_value * 60;
  slider.noUiSlider.set([value]);
}

function changeMinutes(obj){
  var hour_value = parseInt(document.getElementById("hours").value);
  var value =  parseInt(obj.value) + 60*hour_value;
  value = value * 60; 
  slider.noUiSlider.set([value]);
}

function reset(){
  /*document.getElementById("hours").value = 0;
  document.getElementById("minutes").value = 0;*/
  slider.noUiSlider.set([0]);
}

var elements = document.getElementsByClassName('noUi-value');
for(var i=0;i<elements.length;i++){
  elements[i].innerHTML = elements[i].innerHTML/3600;
}

var month_name = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

var today = new Date();
document.getElementById('today').value = (today.getDate() +"/" + (today.getMonth() + 1) + "/" + today.getFullYear());
document.getElementById('date2').innerHTML = today.getDate() + " " + month_name[today.getMonth()] ;
document.getElementById('date2').dataset.month = month_name[today.getMonth()];

var yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
document.getElementById('yesterday').value = (yesterday.getDate() +"/" + (yesterday.getMonth() + 1) + "/" + yesterday.getFullYear());
document.getElementById('date1').innerHTML = yesterday.getDate();
document.getElementById('date1').dataset.month = month_name[yesterday.getMonth()];

yesterday.setDate(yesterday.getDate() - 1);
document.getElementById('day_b_y').value = (yesterday.getDate() +"/" + (yesterday.getMonth() + 1) + "/" + yesterday.getFullYear());
document.getElementById('date0').innerHTML = yesterday.getDate();
document.getElementById('date0').dataset.month = month_name[yesterday.getMonth()];

function sendToSocket(){
  var value = $('input[type="radio"][name="options"]:checked').val();
  var camera = $('input[type="radio"][name="unit"]:checked').val(); 
  if(value == "live"){
    console.log('in live');
    socket.emit("live",{'camera':camera});
  }
  else{
    var date = $('input[type="radio"][name="date"]:checked').val();
    var total_seconds = document.getElementsByClassName("noUi-handle")[0].getAttribute('aria-valuetext');
    socket.emit('playback',{'camera':camera,'date':date,'total_seconds':total_seconds});
    console.log(date,'yha pe');
  }
}

function add_options(element,value){
  for(var i=0;i<value;i++){
    element.options[i] = new Option(i,i);
  }
}


$(document).ready(function(){
  fetch_intrusion((today.getDate() +"-" + (today.getMonth() + 1) + "-" + today.getFullYear()));
});


$('#playback_live :input').change(function(){
  /*$('.playback-show').toggle();*/
  console.log("in playback_live");
  //sendToSocket();
  reset();
});
$('#tx_rx :input').change(function(){
  sendToSocket();
});
var timeoutId;
$('input[type="radio"][name="date"]').change(function(){
  console.log("here in date change");
  $('input[type="radio"][name="date"]').each(function(){
    if($(this).is(':checked')){
      $(this).next('label').children('a').width(60);
      var text = $(this).next('label').children('a');
      $(this).next('label').children('a').html($(text).html() +" " + $(text).data("month"));
      clearTimeout(timeoutId);// clearInterval will also work in place of clearTimeout
      slider.noUiSlider.set([0]);
      fetch_intrusion($(this).val().split("/").join("-"));
    }
    else{
      var text = $(this).next('label').children('a');
      $(text).html($(text).html().split(" ")[0]);
      $(text).width(32);
    }
  });
  //sendToSocket();
});

function fetch_intrusion(date){
  var element='';
  $.ajax({
    url:'/slider/',
    data:{'date':date},
    datatype:'json',
    method : 'GET', 
    success:function(data){
      for(var i=0;i<data.data.length;i++){
        element += '<div class="row valign-wrapper" onclick=changeSlider(this) style="height: 60px;background-color:white;margin-bottom:5px;font-weight:500" data-val='+Date.parse(data.data[i].start_time)+'>' +
          '<div class="col s6 center" style="font-size: 20px;font-family:Roboto;">' + 
            'Area_02' + 
          '</div>' +
          '<div class="col s6" style="font-size: 11px;font-family:Roboto;text-align:right;margin-right:5px">'+
              data.data[i].start_time + 
          '</div>' +
        '</div>';
      }
      $('#timing').html(element);
    },
    error:function(){
      console.log("error");
    }
  });
  //timeoutId = setTimeout(fetch_intrusion,3000,date);
}

function changeSlider(obj){
  var date = new Date(parseInt(obj.dataset.val));
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds =date.getSeconds();
  var value = hours * 3600 + minutes * 60 + seconds;
  slider.noUiSlider.set([value]);
} 

// check the radio when url is hit directly
$('#camera').prop("checked", true);



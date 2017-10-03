from django.shortcuts import render
from slider.models import *
from datetime import datetime,timedelta
from django.conf import settings
from django.http import JsonResponse,HttpResponse
import pytz
import redis
conn = redis.Redis(**settings.REDIS_CONN_SETTINGS)
# Create your views here.
tz = pytz.timezone('Asia/Kolkata')
offset_time = datetime.now().replace(tzinfo=pytz.utc) - datetime.now().replace(tzinfo=tz)

def index(request):
	if request.is_ajax():
		data=[]
		date = request.GET.get('date',None)
		date = datetime.strptime(date, '%d-%m-%Y')
		recent_intrusions = Intrusion.objects.filter(start_time__gte=date,start_time__lt=date+timedelta(days=1)).order_by('-start_time')[:5]
		for recent_intrusion in recent_intrusions:
			obj = {
				'start_time':recent_intrusion.start_time.astimezone(tz).strftime("%d %b %y %H:%M:%S"),
				'Area':'Area_02,' #Currently Hard coded
			}
			data.append(obj)
		return JsonResponse({'data':data})
	return render(request,'slider.html')


def add_intrusion(request):
	morcha = Morcha.objects.get(uuid='4495c277-0eaa-47b4-af28-3f2212b8bb86')
	print morcha
	intrusion = Intrusion(start_time=datetime.now()-timedelta(days=0),end_time=datetime.now(),attempts=1,morcha=morcha)
	intrusion.save()
	return HttpResponse('added')


def fetch_morchas(request):
	#fetching the data from redis
	if request.is_ajax():
		morcha_set = conn.smembers('morcha_uuid')
		morchas_data = []
		# bcoz list are faster than sets while iteration
		morcha_list = list(morcha_set)
		
		for morcha in morcha_list:
			morcha_dict = dict()
			morcha_info = conn.hgetall(morcha)
			morcha_intrusion_info_key = "intrusion:"+morcha;
			morcha_intrusion_info = conn.hgetall(morcha_intrusion_info_key)
			
			morcha_dict['uuid'] = morcha
			morcha_dict['name'] = morcha_info['location_name']
			morcha_dict['status'] = 'neutralized'

			if morcha_intrusion_info and 'neutralized' not in morcha_intrusion_info:
				morcha_dict['status'] = 'intrusion'

			morchas_data.append(morcha_dict)

		return JsonResponse({'morchas_info':morchas_data})

	return render(request,'mapview.html') 			

#include "Particle.h"
#include "dct.h"
#include "SunrunnerGPS.h"
#include "SunrunnerUV.h"
#include "SunrunrStorage.h"
#include "PingPattern.h"
#include "UVPattern.h"
#include "ActivityPattern.h"


SYSTEM_THREAD(ENABLED);

SunrunnerGPS gps;
SunrunnerUV uv;
SunrunrStorage storage;

char dataBuffer[512];

char apiKey[33];

typedef enum{
	IDLE = 0,
	ACTIVE,
	AWAITING_AUTH
} Mode;

Mode deviceMode = AWAITING_AUTH;

unsigned long authTimer = 0;

PingPattern pingRGB = PingPattern(LED_PRIORITY_IMPORTANT);
UVPattern uvRGB = UVPattern(LED_PRIORITY_IMPORTANT);
ActivityPattern actRGB = ActivityPattern(LED_PRIORITY_NORMAL);


unsigned long datalogTimer = 0;

unsigned long pingTimer = 0;
boolean activePing = false;

unsigned long activityNumber = 0;

float uvThreshold = 5;


boolean timerExceeds(unsigned long * timer, unsigned long delay)
{
	unsigned long currentTime = millis();

	//Handle overflow
	if(currentTime < *timer)
	{
		*timer = currentTime;
		return false;
	}

	if(currentTime > *timer + delay)
	{
		*timer = currentTime;
		return true;
	}

	return false;
}

int ping(String command)
{
	pingRGB.setActive();
	publishData(" ");

	pingTimer = millis();
	activePing = true;

	return 0;
}

//Numeric return reference:
//  0: success
//  1: No GPS
//  2: No UV
//  3: No GPS or UV
int publishData(String command)
{
	if(gps.getSatellites() > 0) 
	{
		
		if(uv.isAvailable())
		{
			snprintf(dataBuffer, 512, "{\"time\":%s, \"gps_exists\":true, \"gps_lat\":%f, \"gps_long\":%f, \"gps_speed\":%f, \"uv\":%f, \"deviceId\": \"%s\", \"APIkey\":\"%s\"}", 
				gps.getGPSTime(), gps.getLatitude(), gps.getLongitude(), gps.getGPSSpeed(), uv.getUVIndex(), System.deviceID().c_str(), apiKey);

			Particle.publish("sunrunner", dataBuffer, PRIVATE);

			return 0;
		}
		else
		{
			snprintf(dataBuffer, 512, "{\"time\":%s, \"gps_exists\":true, \"gps_lat\":%f, \"gps_long\":%f, \"gps_speed\":%f, \"uv\":-1, \"deviceId\":\"%s\", \"APIkey\":\"%s\"}", 
				gps.getGPSTime(), gps.getLatitude(), gps.getLongitude(), gps.getGPSSpeed(), System.deviceID().c_str(), apiKey);
			
			Particle.publish("sunrunner", dataBuffer, PRIVATE);

			return 2;	
		}
	}
	else
	{
		if(uv.isAvailable())
		{
			snprintf(dataBuffer, 512, "{\"time\":null, \"gps_exists\":false, \"gps_lat\":0, \"gps_long\":0, \"gps_speed\":0, \"uv\":%f, \"deviceId\": \"%s\", \"APIkey\":\"%s\"}", 
				uv.getUVIndex(), System.deviceID().c_str(), apiKey);

			Particle.publish("sunrunner", dataBuffer, PRIVATE);

			return 1;
		}
		else
		{
			snprintf(dataBuffer, 512, "{\"time\":null, \"gps_exists\":false, \"gps_lat\":0, \"gps_long\":0, \"gps_speed\":0, \"uv\":-1, \"deviceId\": \"%s\", \"APIkey\":\"%s\"}", 
				System.deviceID().c_str(), apiKey);

			Particle.publish("sunrunner", dataBuffer, PRIVATE);
			
			return 3;	
		}
	}
}

void publishActivityData()
{
	snprintf(dataBuffer, 512, "{\"deviceId\":\"%s\", \"APIkey\":\"%s\", \"time\":\"%s\", ", System.deviceID().c_str(), apiKey, storage.getStartTime());
	Particle.publish("newActivity", String(dataBuffer) + String(storage.getAllGPSLatitudes()) + ", " + String(storage.getAllGPSLongitudes()) + ", " + String(storage.getAllUV()) + ", " + String(storage.getAllGPSSpeeds()) + "}", PUBLIC);
}

//Get new API key and replace EEPROM value of the key 
int authReply(const char *event, const char *data)
{
	strncpy(apiKey, data, 32);
	EEPROM.write(0, 1);

	for(int i = 1; i < 33; i++)
		EEPROM.write(i, (uint8_t) apiKey[i-1]);

	deviceMode = IDLE;

	return 0;
}

int uvReply(const char *event, const char *data)
{
	uvThreshold = atof(data);
	return 0;
}

void setup()
{
	gps.begin();
	uv.begin();

	//Test for API key
	if(EEPROM.read(0) == 1)
	{
		deviceMode = IDLE;

		for(int i = 1; i < 33; i++)
			apiKey[i-1] = (char) EEPROM.read(i);

		apiKey[32] = '\0';
	}

	Particle.function("getdata", publishData);
	Particle.function("pingDevice", ping);

    pinMode(BTN, INPUT);
	Particle.subscribe("hook-response/requestAuth", authReply, MY_DEVICES);
	Particle.subscribe("hook-response/uvthreshold", uvReply, MY_DEVICES);

	delay(1000);

	Particle.connect();

	//Get user uv threshold
	Particle.publish("uvthreshold", "{ \"deviceID\":\"" + System.deviceID() + "\"}", PUBLIC);
}

void loop()
{
	if(deviceMode == AWAITING_AUTH)
	{
		//Request every 10 seconds
		if(timerExceeds(&authTimer, 10000))
		{
			Particle.publish("requestAuth", "{ \"deviceID\":\"" + System.deviceID() + "\"}", PUBLIC);
		}
	}
	else
	{
		gps.readGPSData();
		uv.readValues();

		if(uv.getUVIndex() >= uvThreshold)
			uvRGB.setActive();
		else
			uvRGB.setActive(false);
		
		if(timerExceeds(&datalogTimer, 15000))
		{
			storage.newData(gps.getLatitude(), gps.getLongitude(), uv.getUVIndex(), gps.getGPSSpeed());
		}


		if(activePing)
		{
			if(millis() - pingTimer > 5000)
			{
				activePing = false;
				pingRGB.setActive(false);
			}
		}

		if (digitalRead(BTN) == 0)
		{
			if(deviceMode == IDLE)
			{
				storage.newActivity(gps.getGPSTime());
				deviceMode = ACTIVE;
				actRGB.setActive();
			}
			else if(deviceMode == ACTIVE)
			{
				publishActivityData();
				deviceMode = IDLE;
				actRGB.setActive(false);
			}
		}
	}

	delay(50);
}
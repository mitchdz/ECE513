/*
* SunrunnerUV.h
* Purpose: Take in uv sensor data and check availability of the device
*
* @author Lena Voytek
* @version 1.0 11/18/2019 
*/

#ifndef SUNRUNNERUV_H
#define SUNRUNNERUV_H

#include <Adafruit_SI1145.h>

class SunrunnerUV
{
protected:

    Adafruit_SI1145 uv = Adafruit_SI1145();
    boolean available;

    uint16_t lastVisible;
    uint16_t lastIR;
    float lastUV;

public:
    void begin()
	{
		this->available = this->uv.begin();
	}

    void readValues()
    {
        if(!this->available)
            this->available = this->uv.begin();
        else
        {
            this->lastVisible = this->uv.readVisible();
            this->lastIR = this->uv.readIR();
            this->lastUV = this->uv.readUV()/100.0;
        }
        
    }

    uint16_t getVisible()
    {
        return this->lastVisible;
    }

    uint16_t getIR()
    {
        return this->lastIR;
    }

    float getUVIndex()
    {
        return this->lastUV;
    }

    boolean isAvailable()
    {
        return this->available;
    }
};


#endif
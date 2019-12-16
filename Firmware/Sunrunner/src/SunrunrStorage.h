#ifndef SUNRUNRSTORAGE_H
#define SUNRUNRSTORAGE_H

typedef struct datapoint_t
{
    float gps_lat;
    float gps_long;
    float uv;
    float gps_speed;

    datapoint_t * next;

} DataPoint;

char dataOut[30000];

class SunrunrStorage
{
protected:
    char startTime[25];

    DataPoint * head = NULL;

public:
    void newActivity(char * time)
    {
        strncpy(startTime, time, 25);

        //Remove old data
        DataPoint * temp = head;
        while(head != NULL)
        {
            temp = head->next;
            free(head);
            head = temp;
        }
    }

    void newData(float lat, float lng, float uv, float speed)
    {
        if(head == NULL)
        {
            head = (DataPoint *)malloc(sizeof(DataPoint));
            head->gps_lat = lat;
            head->gps_long = lng;
            head->uv = uv;
            head->gps_speed = speed;
            head->next = NULL;
        }
        else
        {
            DataPoint * temp = head;
            while(temp->next != NULL)
                temp = temp->next;

            temp->next = (DataPoint *)malloc(sizeof(DataPoint));
            temp = temp->next;

            temp->gps_lat = lat;
            temp->gps_long = lng;
            temp->uv = uv;
            temp->gps_speed = speed;
            temp->next = NULL;
        }
    }

    char * getAllGPSLatitudes()
    {
        strncpy(dataOut, "\"gps_lat\": \"", 12);
        char tempVal[13];

        DataPoint * temp = head;
        unsigned int index = 13;

        while(temp != NULL)
        {
            sprintf(tempVal, "%f ", temp->gps_lat);
            strncpy(dataOut + index, tempVal, 13);
            index += strlen(tempVal);
        }

        dataOut[index++] = '\"';
        dataOut[index] = '\0';
        return dataOut;
    }

    char * getAllGPSLongitudes()
    {
        strncpy(dataOut, "\"gps_long\": \"", 13);
        char tempVal[13];

        DataPoint * temp = head;
        unsigned int index = 14;

        while(temp != NULL)
        {
            sprintf(tempVal, "%f ", temp->gps_long);
            strncpy(dataOut + index, tempVal, 13);
            index += strlen(tempVal);
        }

        dataOut[index++] = '\"';
        dataOut[index] = '\0';
        return dataOut;
    }

    char * getAllUV()
    {
        strncpy(dataOut, "\"uv\": \"", 7);
        char tempVal[13];

        DataPoint * temp = head;
        unsigned int index = 8;

        while(temp != NULL)
        {
            sprintf(tempVal, "%.2f ", temp->uv);
            strncpy(dataOut + index, tempVal, 13);
            index += strlen(tempVal);
        }

        dataOut[index++] = '\"';
        dataOut[index] = '\0';
        return dataOut;
    }

    char * getAllGPSSpeeds()
    {
        strncpy(dataOut, "\"gps_speed\": \"", 14);
        char tempVal[13];

        DataPoint * temp = head;
        unsigned int index = 15;

        while(temp != NULL)
        {
            sprintf(tempVal, "%.2f ", temp->gps_speed);
            strncpy(dataOut + index, tempVal, 13);
            index += strlen(tempVal);
        }

        dataOut[index++] = '\"';
        dataOut[index] = '\0';
        return dataOut;
    }

    char * getStartTime()
    {
        return this->startTime;
    }
};

#endif
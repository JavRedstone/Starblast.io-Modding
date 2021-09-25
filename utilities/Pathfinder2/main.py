from PIL import Image
from grid import Grid
from dijkstra import dijkstra
from Naked.toolshed.shell import execute_js
import json
import loop
import numpy as np
import os
import pyscreenshot as ImageGrab
from win32api import GetSystemMetrics
import movement
import time
import execute

tierTdict={
    1: 0.12,
    2: 0.14,
    3: 0.2,
    4: 0.4,
    5: 0.5,
    6: 0.6,
    7: 0.7
}

def findrad():
    try:
        width=GetSystemMetrics(0)
        height=GetSystemMetrics(1)
        heightRad=int(height/3.2)
        widthRad=int((8/9)*heightRad)
        xright=width-int(widthRad/2)
        xleft=xright-widthRad
        ydown=height-int(heightRad/4)-int(heightRad/16)
        yup=ydown-heightRad
        return [xleft,yup,xright,ydown]
    except Exception:
        pass
def findcenter():
    width=GetSystemMetrics(0)
    height=GetSystemMetrics(1)
    return [width/2,height/2]

def timeS():
    start = time.time()
    loop.identifyrad(loop.cleanup(loop.capture(findrad())))
    end = time.time()
    receive_value=tierTdict[int(execute.recieve("Please enter your tier level: "))]
    return [receive_value%(end-start),receive_value]

exit=False
while exit !=True:
    response = execute_js('index.js')
    with open("map.json", "r") as map:
        mapdict=json.load(map)
    mapS=mapdict["map_size"]
    mapG=mapdict["map_graph"]
    destX=execute.recieve("Enter your destination X value: ")
    destY=execute.recieve("Enter your destination Y value: ")
    loop.startloop((int(destX),int(destY)), findrad(), findcenter(), int(mapS), mapG, timeS())
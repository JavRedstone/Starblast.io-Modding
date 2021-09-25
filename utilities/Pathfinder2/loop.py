from PIL import Image
import pyscreenshot as ImageGrab
import cv2
import numpy as np
import os
from grid import Grid
from dijkstra import dijkstra
import movement

def capture(radastloc):
    radarLIST=[]
    for i in range(3):
        captureImg=np.array(ImageGrab.grab(bbox=(radastloc[0],radastloc[1],radastloc[2],radastloc[3])).convert('RGB'))
        radarLIST.append(cv2.cvtColor(captureImg, cv2.COLOR_BGR2GRAY))
    return radarLIST

def cleanup(radarLIST):
    rad1=radarLIST[0]
    rad2=radarLIST[1]
    rad3=radarLIST[2]
    radData = np.stack((rad1,rad2,rad3),axis=2)
    return cv2.cvtColor(np.array(Image.fromarray(np.median(radData, axis=2)).convert('RGB')),cv2.COLOR_BGR2GRAY)

def identifyrad(cleanRad):
    astTemp=cv2.cvtColor(cv2.imread('Team_Ast.png'),cv2.COLOR_BGR2GRAY)
    astRes=cv2.matchTemplate(cleanRad,astTemp,cv2.TM_CCOEFF_NORMED)
    threshold=.60
    astloc=np.where(astRes>=threshold)
    splitL=str(astloc)[:str(astloc).index('),')]
    try:
        splitLR=splitL[splitL.index('[')+1:]
        splitLRL=splitLR[:splitLR.index(']')]
        xArr=[splitLRL]
    except Exception:
        pass
    splitR=str(astloc)[str(astloc).index('),')+1:]
    try:
        splitRL=splitR[splitR.index('[')+1:]
        splitRLR=splitRL[:splitRL.index(']')]
        yArr=[splitRLR]
    except Exception:
        pass
    xArrF=str(xArr).replace('}','').replace(']','').replace(' ','').replace('\"','').replace('\\n','').split(',')
    yArrF=str(yArr).replace('}','').replace(']','').replace(' ','').replace('\"','').replace('\\n','').split(',')
    return [xArrF,yArrF]

def identifymap9(mapS,mapG):
    mapStr=str(mapG).replace('[','').replace(',','').replace(' ','').replace('2','0').replace('3','0').replace('4','0').replace('5','0').replace('6','0').replace('7','0').replace('8','0').replace('9','1').replace(']','2')
    eachstr=""
    obs=[]
    i=0
    for c in mapStr:
        j=0
        if c!="2":
            eachstr+=c
        if c == "2":
            for sepc in eachstr:
                if sepc=="1":
                    obs.append((i, j))
                j+=1
            i+=1
            eachstr=""
    return Grid(mapS, mapS, obstacles = obs)
def identifycoord(coordArr,map):
    coords=[]
    for k in range(len(coordArr[0])):
        y=coordArr[0][k]
        x=coordArr[1][k]
    try:
      coords.append((int(int(x)/6.5),(int(int(y)/6.5))))
    except Exception:
      pass
    rVIEW = str(Grid(40, 40, obstacles = coords))
    eachLINE=''
    mapLINE=''
    XINDX=[]
    YINDX=[]
    i=0
    breakcheck=False
    for char in rVIEW:
        if char != "\n":
            eachLINE+=char
        else:
            for syschar in range(20):
                eachlineEX=eachLINE[:20-syschar]
                i=0
            for mapChar in str(map):
                if mapChar != "\n":
                    mapLINE+=mapChar
                else:
                    i+=1
                    breakcheck=False
                    index=mapLINE.find(eachlineEX)
                    if index != -1:
                        XINDX.append(index)
                        YINDX.append(i)
                        breakcheck=True
                        break
                    mapLINE=''
            if breakcheck==True:
                break
        eachLINE=''
    sumX=0
    avgX=0
    for x in XINDX:
        sumX+=x
    avgX=sumX/len(XINDX)
    sumY=0
    avgY=0
    for y in YINDX:
        sumY+=y
    avgY=sumY/len(YINDX)
    return (int(avgX),int(avgY))

def identifymapAll(mapS,mapG):
    mapStr=str(mapG).replace('[','').replace(',','').replace(' ','').replace('2','0').replace('3','0').replace('4','0').replace('5','0').replace('6','0').replace('7','0').replace('8','0').replace('9','1').replace(']','2')
    eachstr=""
    obs=[]
    i=0
    for c in mapStr:
        j=0
        if c!="2":
            eachstr+=c
        if c == "2":
            for sepc in eachstr:
                if sepc=="1":
                    obs.append((i, j))
                j+=1
            i+=1
            eachstr=""
    return Grid(mapS, mapS, obstacles = obs)

def findmovepatt(src,dest,totalmap):
    return str(totalmap.return_moveable(dijkstra(totalmap,src,dest)))

def startloop(dest,radarloc,centerloc,mapS,mapG,timeM):
    return movement.move(findmovepatt(identifycoord(identifyrad(cleanup(capture(radarloc))),identifymap9(mapS,mapG)),dest,identifymapAll(mapS,mapG)),centerloc,timeM[0],timeM[1])
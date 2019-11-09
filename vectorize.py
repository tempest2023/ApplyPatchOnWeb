import numpy as np
from mpl_toolkits import mplot3d
import matplotlib.pyplot as plt

import json
import jieba

def str2value(w,weight=1):
    # weight 为完整的词提供额外权重
    v = 0
    for c in w:
        v+=ord(c)
    return v*weight
# 把序列数据向量化为n*6的向量
# [nodeName, id, class, inlineStyle, role, dataset]
def vectorize(dataList):
    NodeList = 'a,abbr,acronym,address,applet,area,article,aside,audio,b,base,basefont,bdi,bdo,big,blockquote,body,br,button,canvas,caption,center,cite,code,col,colgroup,command,datalist,dd,del,details,dfn,dialog,dir,div,dl,dt,em,embed,fieldset,figcaption,figure,font,footer,form,frame,frameset,h1,h2,h3,h4,h5,h6,head,header,hr,html,i,iframe,img,input,ins,kbd,keygen,label,legend,li,link,main,map,mark,menu,menuitem,meta,meter,nav,noframes,noscript,object,ol,optgroup,option,output,p,param,pre,progress,q,rp,rt,ruby,s,samp,script,section,select,small,source,span,strike,strong,style,sub,summary,sup,table,tbody,td,textarea,tfoot,th,thead,time,title,tr,track,tt,u,ul,var,video,wbr'.split(',')
    NodeMap = {}
    for (i,j) in enumerate(NodeList):
        NodeMap[j]=i
    featureList = ['nodeName','id','class','inlineStyle','role','dataset']
    NodeSizeOver = len(NodeList)+1
    v = np.zeros((len(dataList),6))
    for (ind,item) in enumerate(dataList):
        # check Features
        for f in featureList:
            if(f not in item.keys()):
                item[f]= None
        nodeName = item['nodeName']
        nodeClass = item['class']
        nodeId = item['id']
        nodeStyle = item['inlineStyle']
        nodeRole = item['role']
        nodeDataset = item['dataset']

        # nodeName
        if(nodeName in NodeMap.keys()):
            v[ind][0] = NodeMap[nodeName]
        else:
            v[ind][0] = NodeSizeOver

        # id
        # 将每个字符的ascii值相加作为这一维度的值
        # print('id: '+nodeId)
        valueId = 0
        if(nodeId is not None):
            idList = jieba.cut(nodeId, cut_all = False)
            for eachWord in idList:
                valueId += str2value(eachWord,len(eachWord))
        v[ind][1] = valueId

        # print('class: '+nodeClass)
        valueClass = 0
        if(nodeClass is not None):
            classList = jieba.cut(nodeClass, cut_all=False)
            for eachWord in classList:
                valueClass += str2value(eachWord,len(eachWord))
        v[ind][2] = valueClass

        # inlinneStyle
        valueInlineStyle = 0
        if(nodeStyle is not None and type(nodeStyle) is dict):
            for key in nodeStyle.keys():
                valueInlineStyle += str2value(key)
        v[ind][3] = valueInlineStyle

        # role
        valueRole = 0
        if(nodeRole is not None and type(nodeRole) is dict):
            for key in nodeRole.keys():
                valueRole += str2value(key)
        v[ind][4] = valueRole

        # dataset
        valueDataset = 0
        if(nodeDataset is not None and type(nodeDataset) is dict):
            for key in nodeDataset.keys():
                valueDataset += str2value(key)
        v[ind][5] = valueDataset
    return v

'''
data = {
    root: {
      nodeName: '',
      class: '',
      id: '',
      inlineStyle: '',
      role: '',
      dataset:{},
    },
    children: [{
      nodeName: '',
      class: '',
      id: '',
      inlineStyle: '',
      role: '',
      dataset:{},
    },{} ]
}
'''
def loadDataSet(fileName):
    with open(fileName) as f:
        data = json.load(f)
        # data['children'].append(data['root'])
        data = vectorize(data['children'])
        return data
def Normalization(dataSet):
    epsilon = 0.000001
    n = dataSet.shape[1]
    for i in range(n):
        dataSet[:,i] = (dataSet[:,i]-np.min(dataSet[:,i]))/(np.max(dataSet[:,i])-np.min(dataSet[:,i]+epsilon))
    return dataSet

# 欧氏距离计算
def distEclud(x,y):
    return np.sqrt(np.sum(np.power(x - y, 2)))

# 为给定数据集构建一个包含K个随机质心的集合
def randCent(dataSet,k):
    m,n = dataSet.shape
    centroids = np.zeros((k,n))
    for i in range(k):
        index = int(np.random.uniform(0,m)) #
        centroids[i,:] = dataSet[index,:]
    return centroids

# k均值聚类
def KMeans(dataSet,k):
    m = np.shape(dataSet)[0]  # 行的数目
    n = np.shape(dataSet)[1]  # 列的数目
    # 第一列存样本属于哪一簇
    # 第二列存样本的到簇的中心点的误差
    clusterAssment = np.mat(np.zeros((m,2)))
    clusterChange = True

    # 第1步 初始化centroids
    centroids = randCent(dataSet,k)
    # print('初始化质心:',centroids)
    while clusterChange:
        clusterChange = False
        # 遍历所有的样本（行数）
        for i in range(m):
            minDist = 100000.0
            minIndex = -1

            # 遍历所有的质心
            #第2步 找出最近的质心
            for j in range(k):
                # 计算该样本到质心的欧式距离
                # print('-'*15)
                # print('计算距离:')
                # print(centroids[j,:])
                # print(dataSet[i,:])
                # print('-'*15)
                distance = distEclud(centroids[j,:],dataSet[i,:])

                if distance < minDist:
                    minDist = distance
                    minIndex = j
                # print('质心%d距离:%d, 最小距离:%d, 当前索引:%d'%(j,distance,minDist,minIndex))
            # 第 3 步：更新每一行样本所属的簇
            if clusterAssment[i,0] != minIndex:
                clusterChange = True
                # print('记录最近值:%d'%minDist)
                clusterAssment[i,:] = minIndex,minDist**2
            # print('所有点距离质心的状态:')
            # print(clusterAssment)
        #第 4 步：更新质心
        for j in range(k):
            pointsInCluster = dataSet[np.nonzero(clusterAssment[:,0].A == j)[0]]  # 获取簇类所有的点
            if(pointsInCluster.shape[0]>0):
                centroids[j,:] = np.mean(pointsInCluster,axis=0)   # 对矩阵的行求均值
    return centroids,clusterAssment

def showCluster(dataSet,k,centroids,clusterAssment, dim=2):
    if dim == 2:
        m,n = dataSet.shape

        mark = ['or', 'ob', 'og', 'ok', '^r', '+r', 'sr', 'dr', '<r', 'pr']
        if k > len(mark):
            print("k值太大了")
            return 1

        # 绘制所有的样本
        for i in range(m):
            markIndex = int(clusterAssment[i,0])
            plt.plot(dataSet[i,0],dataSet[i,1],mark[markIndex])

        mark = ['db', '<b', 'pb','Dr', 'Db', 'Dg', 'Dk', '^b', '+b', 'sb', ]
        # 绘制质心
        print('共有%d个质心'%k)
        for i in range(k):
            print('质心坐标(%d,%d)'%(centroids[i,0],centroids[i,1]))
            plt.plot(centroids[i,0],centroids[i,1],mark[i])

        plt.show()
    if dim == 3:
        m,n = dataSet.shape
        ax = plt.axes(projection='3d')
        ax.scatter(dataSet[:,0], dataSet[:,1], dataSet[:,2],  c='r',marker="o")
        ax.scatter(centroids[:,0],centroids[:,1],centroids[:,2], c = 'b',marker = 'x')
        plt.show()
def showCost(costList):
    if(len(costList)<=0):
        return
    x = np.linspace(1,len(costList),len(costList))
    y = np.array(costList)
    plt.plot(x,y)
    plt.show()
def clusterDistanceAssement(k,dataSet,centroids,clusterAssment):
    m = dataSet.shape[0]
    dis = np.zeros((k,2))
    for j in range(k):
        pointsNum = 0.000001
        allPoints = 0.000001
        for i in range(m):
            if(int(clusterAssment[i,0]-j) == 0):
                pointsNum+=1
                dis[j,0]+= distEclud(centroids[j,:],dataSet[i,:])
            allPoints+=1
            dis[j,1] += distEclud(centroids[j,:],dataSet[i,:])
        dis[j,0] = dis[j,0]/pointsNum if pointsNum > 0.000001 else 0
        dis[j,1] = dis[j,1]/allPoints if allPoints > 0.000001 else 0
        # print('cost:质心%d --- %f , 全点距离: %f'%(j+1,dis[j,0],dis[j,1]))
    return dis
def IsOneCluster():
    dataSet = loadDataSet("test.txt")
    dataSet = Normalization(dataSet)
    costList = []
    maxDelta = 0.3
    for k in range(1,dataSet.shape[0]):
        centroids,clusterAssment = KMeans(dataSet,k)
        # print('质心坐标:',centroids)
        cost = clusterDistanceAssement(k,dataSet,centroids,clusterAssment)
        # print('质心cost： ',cost)
        thisCost = np.sum(cost[:,0])/cost.shape[0]
        if(len(costList)==0):
            costList.append(thisCost)
        elif(costList[len(costList)-1]-thisCost > maxDelta):
            costList.append(thisCost)
        else:
            break
    # showCost(costList)
    return len(costList)
    # if(costList[0]>costList[1]*3 or costList[1]>costList[2]*3):
    #     return False
    # else:
    #     return True
    # showCluster(dataSet,k,centroids,clusterAssment,3)

print('是否属于一簇？',IsOneCluster())

require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

/*获取图片相关数据*/
var imageDatas = require('../data/imageDatas.json');

/*利用自执行函数，将图片名信息转成图片URL路径信息*/
imageDatas = (function getImageURL(imageDatasArr) {
    for(var i = 0,j = imageDatasArr.length; i < j; i++){
        var singleImageData = imageDatasArr[i];

        singleImageData.imageURL = require('../images/' + singleImageData.fileName);

        imageDatasArr[i] = singleImageData;
    }
    return imageDatasArr;
})(imageDatas);
/*
获取区间内随机值
 */
function getRangeRandom(low, high){
    return Math.ceil(Math.random() * (high - low) + low);
}

/*
获取0-30°之间的一任意正副值
 */
function get30DegRandom(){
    return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}

/**
 * ImgFigure 单个图片
 */
class ImgFigure extends React.Component {
    /*
    imgFigure的handle处理函数
     */
    handleClick(e){
        if(this.props.arrange.isCenter){
            this.props.inverse();
        }else{
            this.props.center();
        }

        e.stopPropagation();
        e.preventDefault();
    }

    render(){
        var styleObj = {};
        //如果props属性中指定了这张图片的位置，则使用
        if(this.props.arrange.pos){
            styleObj = this.props.arrange.pos;
        }
        //如果图片的旋转角度有值且不为0，则添加旋转角度
        if(this.props.arrange.rotate){
            ['-moz-','-ms-','-webkit-',''].forEach(function(value){
                styleObj['transform'] = value + 'rotate(' + this.props.arrange.rotate +'deg)';
            }.bind(this));
        }

        if(this.props.arrange.isCenter){
            styleObj.zIndex = 11;
        }

        var imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

        return(
            <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick.bind(this)}>
                <img src={this.props.data.imageURL}
                     alt={this.props.data.title}
                />
                <figcaption>
                    <h2 className='img-title'>{this.props.data.title}</h2>
                    <div className='img-back' onClick={this.handleClick.bind(this)}>
                        <p>
                            {this.props.data.desc}
                        </p>
                    </div>
                </figcaption>
            </figure>
        );
    };
}

/**
 * 控制组件
 */
class ControllerUnit extends React.Component{
    handleClick(e){
        if(this.props.arrange.isCenter){
            this.props.inverse();
        }else{
            this.props.center();
        }
        e.stopPropagation();
        e.preventDefault();
    }

    render(){
        var controllerUnitClassName = 'controller-unit';

        //如果对应的是居中的图片，显示控制按钮的居中态
        if(this.props.arrange.isCenter){
            controllerUnitClassName += ' is-center';
            if(this.props.arrange.isInverse){
                controllerUnitClassName += ' is-inverse';
            }
        }

        return (
            <span className={controllerUnitClassName} onClick={this.handleClick.bind(this)}></span>
        );
    }
}

class AppComponent extends React.Component {
    constructor(props){
        super(props);
        this.Constant = {
            centerPos: {
                left: 0,
                right: 0
            },
            hPosRange: {  //水平方向的取值范围
                leftSecX: [0,0],
                rightSecX: [0,0],
                y: [0,0]
            },
            vPosRange: {  //垂直方向的取值范围
                x: [0,0],
                topY: [0,0]
            }
        };
        this.state = {
            imgsArrangeArr: [
                /*{
                    pos: {
                        left: '0',
                        top: '0'
                    },
                    rotate: 0  //旋转角度
                    isInverse: false //表示图片正反面
                    isCenter: false //图片是否居中
                }*/
            ]
        };
    }

    //组件加载以后为每张图片计算其位置的范围
    componentDidMount(){
        //首先拿到舞台的大小
        let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
            stageW = stageDOM.scrollWidth,
            stageH = stageDOM.scrollHeight,
            halfStageW = Math.ceil(stageW / 2),
            halfStageH = Math.ceil(stageH / 2);
        //拿到一个imageFigure的大小
        let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
            imgW = imgFigureDOM.scrollWidth,
            imgH = imgFigureDOM.scrollHeight,
            halfImgW = Math.ceil(imgW / 2),
            halfImgH = Math.ceil(imgH / 2);
        //计算中心图片的位置点
        this.Constant.centerPos = {
            left:halfStageW - halfImgW,
            top:halfStageH - halfImgH
        };
        //计算左侧右侧区域图片排布位置的取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;
        //计算上侧区域图片排布位置的取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;
        this.rearRange(0);
    }

    /**翻转图片
     *
     */
    inverse(index){
        return function (){
            var imgsArrangeArr = this.state.imgsArrangeArr;

            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
            this.setState({
                imgsArrangeArr: imgsArrangeArr
            });
        }.bind(this);
    }

    /**
     * 利用rearRange函数，居中对应indec的图片
     * @param {[index]} [需要被居中的图片对应的图片信息数组的index值]
     * @return {Function}
     */
    center(index) {
        return function(){
            this.rearRange(index);
        }.bind(this);
    }

    /*
    重新布局所有图片
     */
    rearRange(centerIndex){
        var imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSex = hPosRange.leftSecX,
            hPosRangeRightSex = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,

            imgsArrangeTopArr = [],

            topImgNum = Math.floor(Math.random() * 2),  //取一个或者不取
            topImgSliceIndex = 0,
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

        //居中centerIndex图片 居中的centerIndex图片不需要旋转
        imgsArrangeCenterArr[0] = {
            pos: centerPos,
            rotate: 0,
            isCenter: true
        };

        //取出要布局上侧的图片的状态信息
        topImgSliceIndex =  Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSliceIndex,topImgNum);

        //布局位于上侧的图片
        imgsArrangeTopArr.forEach(function(value, index){
            imgsArrangeTopArr[index] = {
                pos: {
                    top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                    left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
                },
                isInverse: false,
                rotate: get30DegRandom(),
                isCenter: false
            };
        });

        //布局左右两侧的图片
        for(var i = 0, j = imgsArrangeArr.length, k = j / 2;i < j; i++){
            var hPosRangeLORX = null;

            //前半部分布局左边 又半部分布局右边
            if(i < k){
                hPosRangeLORX = hPosRangeLeftSex;
            }else{
                hPosRangeLORX = hPosRangeRightSex;
            }

            imgsArrangeArr[i] = {
                pos: {
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                    left: getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            }

        }

        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
            imgsArrangeArr.splice(topImgSliceIndex, 0, imgsArrangeTopArr[0]);
        }

        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        this.setState({
            imgsArrangeArr: imgsArrangeArr
        });
    }

    render() {
        var controllerUnits = [],
            imgFigures = [];

        imageDatas.forEach(function(value, index){
            if(!this.state.imgsArrangeArr[index]){
                this.state.imgsArrangeArr[index] = {
                    pos: {
                        left: '0',
                        top: '0'
                    },
                    rotate: 0,
                    inInverse: false,
                    isCenter: false
                };
            }
            imgFigures.push(<ImgFigure data={value} ref={'imgFigure' + index}
                arrange={this.state.imgsArrangeArr[index]}
                key={index} inverse={this.inverse(index)} center={this.center(index)} />);
            controllerUnits.push(<ControllerUnit arrange={this.state.imgsArrangeArr[index]}
                key={index} inverse={this.inverse(index)} center={this.center(index)}/>);
        }.bind(this));

        return (
            <section className="stage" ref="stage">
                <section className="img-sec">
                    {imgFigures}
                </section>
                <nav className="controller-nav">
                    {controllerUnits}
                </nav>
            </section>
        );
    }
}

AppComponent.defaultProps = {

};

export default AppComponent;

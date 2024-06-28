// ==UserScript==
// @name         X Image Enlarge Tool
// @name:zh-CN   推特图片放大
// @namespace    https://github.com/yanzhili/xImageEnlarge
// @version      2024-06-24
// @description  Add a button on the left top conner of a image,for convenience of displaying long images on X
// @description:zh-CN 在图片右上角显示一个放大按钮，方便显示推特中的长图
// @author       James.Yan
// @match        https://x.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// @license      MIT
// ==/UserScript==

;(function () {
  'use strict'

  window.dev = false
  const MatchPic = 'pbs.twimg.com/media'
  const MarkTag = 'zx-btn-added'
  function main() {
    initFullscreenDiv()
    observeHtml((imgElement) => {
      addButton(imgElement.parentElement, imgToLarge(imgElement.src))
    })
  }

  function isLongImage(imgSrc) {
    if (
      imgSrc.indexOf('name=4096x4096') > -1 ||
      imgSrc.indexOf('name=large') > -1
    ) {
      return true
    }
    return false
  }

  function addButton(parentElement, imgSrc) {
    if (parentElement.id.indexOf('zx-') > -1) {
      return
    }

    if (parentElement.getAttribute(MarkTag)) {
      log(imgSrc, 'Btn-Added')
      return
    }

    let button = document.createElement('div')
    button.id = genRandomID('btn')
    button.style =
      'width:50px;height:25px;line-height:25px;text-align: center;font-size:12px;font-famliy:ui-monospace;cursor: pointer;color: white;'
    button.style.backgroundColor = '#000'
    button.style.opacity = '0.7'
    button.innerText = 'ZOOM'
    button.onclick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      displayFullScreenImg(imgSrc)
    }
    parentElement.setAttribute(MarkTag, 'added')
    parentElement.appendChild(button)
  }

  function isMediaImg(img) {
    return img.indexOf(MatchPic) > -1
  }

  function observeHtml(imgAddedCallback) {
    const targetNode = document.body
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['src'],
    }
    const callback = function (mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (
          mutation.attributeName == 'src' &&
          isMediaImg(mutation.target.src)
        ) {
          imgAddedCallback(mutation.target)
        }
      }
    }
    const observer = new MutationObserver(callback)
    observer.observe(targetNode, config)
    // observer.disconnect()
  }

  function imgToLarge(imgSrc) {
    if (!imgSrc) return
    let nameValue = ''
    if (imgSrc.indexOf('name=') > -1) {
      let arr1 = imgSrc.split('?')
      if ((arr1.length = 2)) {
        let str1 = arr1[1]
        let arr2 = str1.split('&')
        if (arr2) {
          arr2.map((i) => {
            let arr3 = i.split('=')
            if (arr3.length == 2 && arr3[0] == 'name' && arr3[1] != 'large') {
              let tempNameValue = arr3[1]
              if (tempNameValue.indexOf('x') > -1) {
                let arr4 = tempNameValue.split('x')
                //大图不替换
                if (Number(arr4[0]) < 1024) {
                  nameValue = arr3[1]
                }
              } else {
                nameValue = arr3[1]
              }
            }
          })
        }
      }
    }
    if (nameValue) {
      imgSrc = imgSrc.replace(`name=${nameValue}`, 'name=large')
    }
    log(imgSrc, 'Large-Imgage-Src')
    return imgSrc
  }

  // (1)、页面所有内容加载完成执行
  window.onload = function () {
    main()
  }

  const ImgInitCss = 'margin: auto;width:auto;height:auto;cursor:zoom-in'
  const FSDivId = 'zx-fullsceen-div-id'
  const FSImgId = 'zx-fullsceen-img-id'
  function initFullscreenDiv() {
    let fsDiv = document.createElement('div')
    fsDiv.id = FSDivId
    fsDiv.style =
      'text-align: center;width:100%;height:100%; position: fixed;top: 0px;bottom: 0px;overflow-y:auto;display:none'
    fsDiv.style.backgroundColor = 'black'
    fsDiv.onclick = () => {
      dismissImg()
    }
    let imgElmt = document.createElement('img')
    imgElmt.id = FSImgId
    imgElmt.style = ImgInitCss
    imgElmt.onclick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (imgElmt.style.cursor == 'zoom-in') {
        imgElmt.style = 'margin: auto;width:100%;height:auto;cursor:zoom-out'
      } else {
        imgElmt.style = ImgInitCss
      }
    }

    fsDiv.appendChild(imgElmt)

    let closeImgDiv = document.createElement('div')
    closeImgDiv.style =
      'top: 0;right: 0px;margin-top: 10px;margin-right: 10px;width: 40px;height: 40px;position: fixed;'

    closeImgDiv.style.backgroundColor = '#000'
    closeImgDiv.style.opacity = '0.8'
    closeImgDiv.style.backgroundImage =
      'url(data:image/svg+xml;base64,PHN2ZyB0PSIxNzE5NTU1MTg1MTM4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE0MDAzIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxwYXRoIGQ9Ik01MTAuODA5NiA0MjAuMzAwOGwzMzUuMjk2LTMzNS4yOTYgOTAuNTA4OCA5MC41MDg4LTMzNS4yOTYgMzM1LjI5NiAzMzUuMjk2IDMzNS4yOTYtOTAuNTA4OCA5MC41MDg4LTMzNS4yOTYtMzM1LjI5Ni0zMzUuMjk2IDMzNS4yOTYtOTAuNTA4OC05MC41MDg4IDMzNS4yOTYtMzM1LjI5Ni0zMzUuMjk2LTMzNS4yOTYgOTAuNTA4OC05MC41MDg4eiIgZmlsbD0iI2ZmZmZmZiIgcC1pZD0iMTQwMDQiPjwvcGF0aD48L3N2Zz4=)'
    closeImgDiv.style.backgroundRepeat = 'no-repeat'
    closeImgDiv.style.backgroundSize = 'cover'
    closeImgDiv.style.cursor = 'pointer'
    closeImgDiv.onclick = () => {
      dismissImg()
    }

    fsDiv.appendChild(closeImgDiv)
    document.body.appendChild(fsDiv)
  }

  function displayFullScreenImg(imgSrc) {
    let fsDiv = document.getElementById(FSDivId)
    fsDiv.style.overflowY = 'overflow-y:auto'
    fsDiv.style.display = 'flex'
    fsDiv.style.justifyContent = 'center'
    fsDiv.style.alignItems = 'center'

    let imgElm = document.getElementById(FSImgId)
    if (!imgElm) return
    imgElm.setAttribute('src', imgSrc)
  }

  function dismissImg() {
    let fsDiv = document.getElementById(FSDivId)
    fsDiv.style.display = 'none'
    let img = document.getElementById(FSImgId)
    img.style = ImgInitCss
  }

  function genRandomID(tag) {
    return `zx-${tag}-${Math.random().toString(36).slice(-8)}`
  }

  /**
   * 将标准时间格式化
   * @param {Date} time 标准时间
   * @param {String} format 格式
   * @return {String}
   */
  function moment(time) {
    // 获取年⽉⽇时分秒
    let y = time.getFullYear()
    let m = (time.getMonth() + 1).toString().padStart(2, `0`)
    let d = time.getDate().toString().padStart(2, `0`)
    let h = time.getHours().toString().padStart(2, `0`)
    let min = time.getMinutes().toString().padStart(2, `0`)
    let s = time.getSeconds().toString().padStart(2, `0`)
    return `${y}-${m}-${d} ${h}:${min}:${s}`
  }

  function log(msg, tag) {
    if (!window.dev) {
      return false
    }
    if (tag) {
      console.log(`${moment(new Date())}  ${tag}`, msg)
    } else {
      console.log(`${moment(new Date())}  ${msg}`)
    }
  }
})()

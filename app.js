let cntr,output,txtCssClassName,tabs,testCss,hlp,aniObj,aniStart,frm,btnCopy,btnGenPen,cpdata
let bDown = false
let movementRecordingByIndex = []
let sCssClassName = "sample"
let lastLoggedMovement
const MS_PER_FRAME = 42
const FINGERTIP_THRESHOLD = 85   // max size of pressing area to draw with
const app = {}
app.debug = false
app.activeTabId = "recordTab"
app.lastRecordedCssClassName = ""
const PEN = "https://codepen.io/orvilleChomer/pen/wvbaxQW"
const INIT_PROMPTS = 0
const BEGIN_DRAW_PROMPTS = 1
const CURRENTLY_DRAWING_PROMPTS = 2
const COMPLETED_DRAWING_PROMPTS = 3

const PROMPTS = [[
  "In this White Drawing Area...",
  "In this White Drawing Area...",
  "Move your [Mouse] to a Starting Point",
  "(Or When Applicable)<br><br>Your [Finger] to a Starting Point",
  "(Or When Applicable)<br><br>Your [Stylus] to a Starting Point",
  "Then Hold down your Pointer and",
  "Draw your Animation Movement",
  "Then,","Then,",
  "Release your Pointer to Finish Recording!",
  "Release your Pointer to Finish Recording!",
  ""
],["You have started to record your Animation",
  "Now Begin to Draw your Animation Movement..."],[
    "Continue Drawing your Animation Movement",
    "Release your Pointer to Finish Recording!"
  ],[
    "You have finished recording your Animation Movement!",
    "Go to the 'Test Animation' tab to see what your Animation Looks Like!",
    "Go to the 'Test Animation' tab to see what your Animation Looks Like!",
    "Go to the 'CSS Code' tab to get the CSS Code that was generated",
    "Go to the 'CSS Code' tab to get the CSS Code that was generated",
    "Or, Start Recording a NEW Animation HERE on the 'Record Animation' tab...",
     "Or, Start Recording a NEW Animation HERE on the 'Record Animation' tab...",
    "And Follow the Steps that you Did Before!",
    "And Follow the Steps that you Did Before!",""
  ]]

let activePrompts 
let nCurrentPromptIndex
let nLastPromptId = -1
let nTimerId = -1
let attract


function pageSetup() {
  console.clear()
  movementRecordingByIndex = []  // I have a complete lack of trust!
  attract = document.getElementById("attract")
  attract.addEventListener("click", hideAttract)
  
  tabs = document.getElementsByClassName("tabs")[0]
  tabs.addEventListener("click", tabChange)
  testCss = document.getElementById("testCss")
  txtCssClassName = document.getElementById("txtCssClassName")
  txtCssClassName.value = sCssClassName
  
  
  output = document.getElementById("output")
  hlp = document.getElementById("hlp")
  aniObj = document.getElementById("aniObj")
  aniStart = document.getElementById("aniStart")
  frm = document.getElementById("frm")  // our form with its data we are posting to create a CodePen (if desired)
  btnCopy = document.getElementById("btnCopy")
  btnCopy.addEventListener("click", copyToClipboard)
  btnGenPen = document.getElementById("btnGenPen")
  btnGenPen.addEventListener("click", genPen)
  
  cntr = document.getElementById("cntr")
  cntr.addEventListener("pointerdown", handleMouseDown)
  cntr.addEventListener("pointermove", handleMouseMove)
  cntr.addEventListener("pointerup", handleMouseUp)
  
 // console.log("about to set drawingCursor element reference")
 // drawingCursor = document.getElementById("drawingCursor")
 // console.log("after setting reference")
  
  cpdata = document.getElementById("cpdata")
  setPrompts(INIT_PROMPTS)
  displayPrompts()
  console.log("made it to the end of pageSetup")
} // end of pageSetup


function genPen(evt) {
  evt.preventDefault()
  frm.submit()
} // end of genPen

function hideAttract(evt) {
  evt.preventDefault()
  attract.style.display = "none"
} // end of hideAttract


function displayPrompts() {
  if (nTimerId > -1) {
    clearTimeout(nTimerId)    
  } // end if
  
  nTimerId = -1
  
  hlp.innerHTML = activePrompts[nCurrentPromptIndex]
  
  nCurrentPromptIndex = nCurrentPromptIndex + 1
  
  if (nCurrentPromptIndex > activePrompts.length-1) nCurrentPromptIndex = 0
  nTimerId = setTimeout(displayPrompts, 2200)
} // displayPrompts


function setPrompts(nPromptsId) {
  if (nLastPromptId === nPromptsId) return
  
  activePrompts = PROMPTS[nPromptsId]
  nCurrentPromptIndex = 0
  nLastPromptId = nPromptsId
} // setPrompts



function tabChange(evt) {
  evt.preventDefault()
  const el = evt.target
  
  if (el.classList.contains("tab-disabled")) {
    return
  } // end if
  
  if (el.classList.contains("tab")) {
    if (el.id !== app.activeTabId) {
      const lastTab = document.getElementById(app.activeTabId)
      const lastTabCntr = document.getElementById(app.activeTabId+"Cntr")
      lastTab.classList.remove("tab-active")
      el.classList.add("tab-active")
      lastTabCntr.style.display = "none"
      const currTabCntr = document.getElementById(el.id+"Cntr")
      currTabCntr.style.display = ""
      app.activeTabId = el.id
    } // end if (el.id !== app.activeTabId)
  } // end if (el.id !== app.activeTabId)
  
} // end of tabChange


function enableTabs() {
  const tabs = document.getElementsByClassName("tab")
  for (let n=0;n < tabs.length;n++) {
    const tab = tabs[n]
    if (tab.classList.contains("tab-disabled")) {
      tab.classList.remove("tab-disabled")
    } // end if    
    
  } // next n
  
} // end of enableTabs




function handleMouseDown(evt) {
  evt.preventDefault()
  
  if (evt.width > FINGERTIP_THRESHOLD || evt.height > FINGERTIP_THRESHOLD) {
    return
  } // end if
  
  bDown = true
  if (aniObj.classList.contains(sCssClassName)) {
    aniObj.classList.remove(sCssClassName)
  } // end if
  
  setPrompts(BEGIN_DRAW_PROMPTS)
  
  
  
  app.startTime = new Date().getTime()
  app.x = evt.offsetX.toFixed(2) - 0
  app.y = evt.offsetY.toFixed(2) - 0
  
  aniStart.style.left = app.x + "px"
  aniStart.style.top = app.y + "px"
  aniStart.style.display = ""
  
  movementRecordingByIndex = []
  recordMovement(evt)
} // end of handleMouseDown




function handleMouseUp(evt) {
  evt.preventDefault()
  bDown = false
  aniStart.style.display = "none"
  
  setPrompts(COMPLETED_DRAWING_PROMPTS)
  app.endTime = new Date().getTime()
  recordMovement(evt)
  output.value = genCss(false)
  testCss.innerHTML = genCss(true)
  enableTabs()
  app.lastRecordedCssClassName = sCssClassName
  
  if (!aniObj.classList.contains(sCssClassName)) {
    aniObj.classList.add(sCssClassName)
  } // end if
  
  const cpData1 = generateCodePenData()
  cpdata.value = JSON.stringify(cpData1)
  
  hlp.innerText = "Recording Complete!"
} // end of handleMouseUp




function handleMouseMove(evt) {
  evt.preventDefault()
  
  if (evt.width > FINGERTIP_THRESHOLD || evt.height > FINGERTIP_THRESHOLD) {
    return
  } // end if
  
  drawingCursor.style.left = evt.offsetX + "px"
  drawingCursor.style.top = evt.offsetY + "px"
  recordMovement(evt)
} // end of handleMouseMove


function genCss(bInfiniteLoop, options) {
  console.log("genCss called")
  let bCssTimingData = true
  let prevMovement
  let nAnimationDuration = app.endTime - app.startTime
  const cd = []
  // cd.push("")
  cd.push("/* Generated CSS Animation Output */")
  cd.push("")
  cd.push("@keyframes "+sCssClassName+"-ani {")
  
  debugOutput("MS_PER_FRAME: "+MS_PER_FRAME, cd)
  debugOutput("app.endTime: "+app.endTime, cd)
  debugOutput("", cd)
  console.log(movementRecordingByIndex)
  let nMax = movementRecordingByIndex.length
  for (let n=0; n < nMax; n++) {
    const mouseMovement = movementRecordingByIndex[n]
    let pct = 0
    pct = (mouseMovement.totalTime / nAnimationDuration) * 100

    pct = pct.toFixed(1) - 0
    
    if (n=== nMax - 1) pct=100
    
    let sTranslate = "translate: "+mouseMovement.translateX+"px "
    sTranslate = sTranslate +mouseMovement.translateY+"px;"
    
    
    cd.push("   " + pct + "% {")
    
    if (bCssTimingData && pct > 0) {
      cd.push("      /* below is "+mouseMovement.totalTime+" ms into a "+nAnimationDuration+" ms animation */ ")
    } // end if
    
    cd.push("      "+sTranslate)
    
    
    cd.push("      }")
    debugOutput("mouseMovement.totalTime: "+mouseMovement.totalTime, cd)
    prevMovement = mouseMovement
  } // next n
  
  cd.push("}")
  cd.push("")
  cd.push("."+sCssClassName+" {")
  cd.push("   position: absolute;")

  cd.push("   left: "+app.x+"px;")
  cd.push("   top: "+app.y+"px;")
  cd.push("   animation-name: "+sCssClassName+"-ani;")
  cd.push("   animation-duration: "+nAnimationDuration+"ms;")
  cd.push("   animation-timing-function: linear;")
  
  if (bInfiniteLoop) {
    cd.push("   animation-iteration-count: infinite;")
  } // end if
  
  cd.push("}")
  
  console.log("genCss finished")
  
  return cd.join("\n")
  
} // end of genCss



function recordMovement(evt) {
  const mouseMovement = {}
  //mouseMovement.x2 = evt.offsetX.toPrecision(1) - 0
  //mouseMovement.y2 = evt.offsetY.toPrecision(1) - 0
  mouseMovement.x2 = evt.offsetX.toFixed(2) - 0
  mouseMovement.y2 = evt.offsetY.toFixed(2) - 0
  
  //mouseMovement.x = evt.offsetX
  //mouseMovement.y = evt.offsetY
  
  mouseMovement.x = evt.offsetX.toFixed(2) - 0
  mouseMovement.y = evt.offsetY.toFixed(2) - 0
  
  mouseMovement.deltaX = 0
  mouseMovement.deltaY = 0
  mouseMovement.ts = new Date().getTime()
  mouseMovement.deltaTs = 0
  mouseMovement.translateX = 0
  mouseMovement.translateY = 0
  
  
  if (movementRecordingByIndex.length > 0) {
    const prevMovement = movementRecordingByIndex[movementRecordingByIndex.length-1]
    
    if (mouseMovement.x === prevMovement.x && mouseMovement.y === prevMovement.y) return  // redundant item do not record!
    
    mouseMovement.deltaTs = mouseMovement.ts - prevMovement.ts
    
    if (mouseMovement.deltaTs < MS_PER_FRAME) return
    
    
    if (bDown ) {
      setPrompts(CURRENTLY_DRAWING_PROMPTS)
    } // end if
    
    
    
    mouseMovement.deltaX = prevMovement.x - mouseMovement.x
    mouseMovement.deltaY = prevMovement.y - mouseMovement.y
    const translateX = mouseMovement.x - app.x
    const translateY = mouseMovement.y - app.y
    mouseMovement.translateX =  translateX.toFixed(2)
    mouseMovement.translateY =  translateY.toFixed(2)
  } // end if
  
  mouseMovement.totalTime = mouseMovement.ts - app.startTime  
  
  movementRecordingByIndex.push(mouseMovement)
  lastLoggedMovement = mouseMovement
} // end of recordMovement


function debugOutput(sValue, cd) {
  if (!app.debug) return
  cd.push(sValue)
} // end of debugOutput



function copyToClipboard(evt) {
  evt.preventDefault()
  navigator.clipboard.writeText(output.value)
}// end of copyToClipboard


function generateSampleCodePenHtml() {
  let s = []
  // s.push("")
  s.push("<!-- ############################################")
  s.push("")
  s.push("  This 'Pen' was generated by the:")
  s.push("  'Basic CSS Movement Animation Recorder' !")
  s.push("")
  s.push("  You can access the Recorder at:")
  s.push("    "+PEN)
  s.push("")
  s.push("  You can use it to:")
  s.push("   - crudely create your own CSS movement animations,")
  s.push("   - Generate CSS code which you can copy to the Clipboard...")
  s.push("   - Or, generate a 'Pen' (like this one)")
  s.push("     with which you can demonstrate your freshly created animation!")
  s.push("")
  s.push("  ############################################ -->")
  s.push("")
  s.push("<h1>Sample CSS Animation</h1>")
  s.push("")
  s.push("<div class='basic-ani-cursor "+sCssClassName+"'></div>")
  s.push("")
  return s.join("\n")
} // end of generateSampleCodePenHtml




function generateSampleCodePenCss() {
  let s = []
  // s.push("")
  
  s.push(":root {")
  s.push("  box-sizing:border-box;")
  s.push("  --cursor-size:30px;")
  s.push("}")
  s.push("")
  s.push('@import url("https://fonts.googleapis.com/css?family=Lato:400,400i,700");')
  s.push("")
  s.push("body {")
  s.push("  background-color:silver;")
  s.push("  font-family: Lato, sans-serif;")
  s.push("}")
  s.push("")
  s.push(".basic-ani-cursor {")
  s.push("  position:absolute;")
  s.push("  background-color:brown;")
  s.push("  width:var(--cursor-size);")
  s.push("  height:var(--cursor-size);")
  s.push("  border:solid orange 4px;")
  s.push("  rotate:45deg;")
  s.push("  pointer-events: none;")
  s.push("  opacity:.8;")
  s.push("}")
  s.push("")
  
  return s.join("\n") + output.value
} // generateSampleCodePenCss



function generateCodePenData() {
  const cpData1 = {}
  cpData1.html = generateSampleCodePenHtml()
  cpData1.css = generateSampleCodePenCss()
  cpData1.js = "/* Nothing to see here!   */"
  cpData1.title = "Sample CSS Movement Animation"
  
  return cpData1
} // end of generateCodePenData


window.addEventListener("load", pageSetup)
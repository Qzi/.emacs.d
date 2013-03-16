
.emacs.d
---------

我学习emacs的备份，才刚开始，慢慢来吧 ...   
自定义的部分能用英文注释就尽量用英文，不能就用中文了 ...   

个人配置模块说明
---------------
- init-repo.el: 在线仓库和本地仓库
- init-env.el: 进行环境变量的设置
- init-ui.el: 进行UI设置
- init-keymap.el: 进行部分按键映射（有些按键映射没放在里面，而放在相应模块里保持整体性）
- ... 

*********************************************************************************
emacs for web‘s jobs
--------------------
TAB
`(setq-default indent-tabs-mode  nil)` ;; 关闭默认的缩进设置
`M-x tabify` 将所有超过两个的连接空格使用TAB替换掉
`M-x untabify` 将所有TAB使用适当个数的空格替换掉

显示空白
`M-x whitespace-mode` 显式地查看空白  

*********************************************************************************

代码浏览
-------

ecb
调整窗口大小，然后调用`M-x ecb-store-window-sizes`来保存设置
其他的参见init里面的配置

*********************************************************************************

- `M-x help-with-tutorial-spec-language <RET>` 指定教程语言
- `C-h f` 查看已经装载函数
- `C-h v` 查看已经转载的变量
- `C-h k` 查看快捷键对应的功能  
- `M-x lisp-interaction-mode` 下可以查看现有的默认设置，例如 `global-font-lock-mode` 然后 `C-j` 可以查看其值  

###加载插件文件夹
>(add-to-list 'load-path "~/.emacs.d/elpa/zencoding-mode-0.5.1")

###快捷键绑定
a. 键位映 射图：多个按键绑定构成的一个集合。Emacs中有两类映射图：(1).全局影射图：对所有模式的编辑缓冲区都起作用的按键映射图 (2).局部映射图：对具体的编辑模式起作用的映射图。例如：c模式、文本模式等。当按下某个按键时，Emacs会首先查看当前编辑缓冲区的局部映射图里 有没有对它进行定义。如果没有，就会查找全局映射图。如果找到了与按键对应的定义项，那么按键关联的命令就会被执行。  

b. 如果自定义的快捷键与系统中默认的快捷键冲突，则系统中默认的快捷键将会被替换  


1. (define-key keymap "keystroke" 'command-name)：将快捷键定义保存到指定的keymap中
2. (global-set-key "keystroke" 'command)：只能将快捷键定义保存到全局keymap射图中
3. (local-set-key "keystroke" 'command-name)：只能将按键绑定到局部映射图中。每种编辑模式都对应了一张局部映射图。
4. keystroke字符串中，必须使用\C来代表字符Ctrl，\M来代表字符Alt

### 变量设置
(setq auto-save-interval 800)


### 数据类型
- t：true
- nil：false
- 字符：以?开头。例如：?x代表字符xS     
- 字符串：使用""括起来
- 标志符：以'开头。例如：表示函数名时使用‘command-name,返回其内容

###常用函数
add-hook：该函数用来将某个函数与指定的模式绑定，当emacs进入相应的模式时，将自动调用与该模式绑定的函数。  
(add-hook 'sgml-mode-hook 'zencoding-mode)    

require：该函数检测在当前emacs会话中是否加载了指定的插件，如果没有，则使用load函数来从系统的LISP目录中加载指定的插件。  
(require 'zencoding-mode)     


### emacs compile
`emacs -batch -f batch-byte-compile powerline.el` 编译成.elc  

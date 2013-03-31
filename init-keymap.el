;; author: qzi
;; email: i@qzier.com
;; content: key map


;; mac-keyboard
(setq mac-command-modifier nil
      mac-option-modifier 'meta
      mac-allow-anti-aliasing t
      mac-command-key-is-meta nil)


;; 行首, 设定mark以及行尾.
;;(global-set-key [(meta \1)] 'move-beginning-of-line)
;;(global-set-key [(meta \2)] 'set-mark-command) 
;;(global-set-key [(meta \3)] 'move-end-of-line)


;; defun in init-utils
(global-set-key (kbd "M-3") 'copy-lines)


;; ibuffer
(global-set-key (kbd "C-x C-b") 'ibuffer)


;;;; desc: ecb
;;;; deps: ecb+cedet
;;;; 各窗口间切换
;;(global-set-key (kbd "C-c h") 'windmove-left)	
;;(global-set-key (kbd "C-c l") 'windmove-right)
;;(global-set-key (kbd "C-c k") 'windmove-up)
;;(global-set-key (kbd "C-c j") 'windmove-down)
;; 
;;;; 隐藏和显示ecb窗口
;;(define-key global-map [(f1)] 'ecb-hide-ecb-windows)
;;(define-key global-map [(f2)] 'ecb-show-ecb-windows)
;; 
;;;; 使某一ecb窗口最大化
;;(define-key global-map "\C-c\ 1" 'ecb-maximize-window-directories)
;;(define-key global-map "\C-c\ 2" 'ecb-maximize-window-sources)
;;(define-key global-map "\C-c\ 3" 'ecb-maximize-window-methods)
;;(define-key global-map "\C-c\ 4" 'ecb-maximize-window-history)
;;
;;;; 恢复原始窗口布局
;;(define-key global-map "\C-c`" 'ecb-restore-default-window-sizes)
;;

;; desc: toggle-fullscreen
;; deps: ~/.emacs.d/init-utils.el
(global-set-key [f12] 'toggle-fullscreen)


;; cua-mode
(global-set-key (kbd "C-c C-u C-a ") 'cua-set-rectangle-mark)


;; 用"%"在匹配的括号之间来回跳转
(global-set-key "%" 'match-paren)


;; run js using node.js
(global-set-key[(meta o)] 'runjs) ;bind-key alt+o:


;; flymake for js
;;(global-set-key [f5] 'flymake-display-err-menu-for-current-line)

(provide 'init-keymap)

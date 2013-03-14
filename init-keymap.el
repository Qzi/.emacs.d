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
(global-set-key (kbd "C-c l") 'copy-lines)

;; ibuffer
(global-set-key (kbd "C-x C-b") 'ibuffer)

;; ecb
;; ====
;; deps: ecb+cedet
;;;; 各窗口间切换
(global-set-key [M-left] 'windmove-left)
(global-set-key [M-right] 'windmove-right)
(global-set-key [M-up] 'windmove-up)
(global-set-key [M-down] 'windmove-down)
 
;;;; 隐藏和显示ecb窗口
(define-key global-map [(f1)] 'ecb-hide-ecb-windows)
(define-key global-map [(f2)] 'ecb-show-ecb-windows)
 
;;;; 使某一ecb窗口最大化
(define-key global-map "\C-c\ 1" 'ecb-maximize-window-directories)
(define-key global-map "\C-c\ 2" 'ecb-maximize-window-sources)
(define-key global-map "\C-c\ 3" 'ecb-maximize-window-methods)
(define-key global-map "\C-c\ 4" 'ecb-maximize-window-history)
;;;; 恢复原始窗口布局
(define-key global-map "\C-c`" 'ecb-restore-default-window-sizes)




(provide 'init-keymap)

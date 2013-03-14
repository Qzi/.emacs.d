;; author: qzi
;; email: i@qzier.com
;; content: ui setting


;; window-system setting
(if (display-graphic-p)
 (if window-system
    (set-frame-size (selected-frame) 100 30)) ;; {column:100, row:24}
)
;; tool-bar-mode
(tool-bar-mode 0)
;;
;; scroll-bar-mode
(scroll-bar-mode 0)

;; speedbar
;;(if (display-graphic-p)
;;    (speedbar)
;;)
;;
;; column number
(column-number-mode t)

;; size of file 
(size-indication-mode t)

;; resize mimibuffer windows
(setq resize-mini-windows t)

;; load theme
(if (display-graphic-p)
    (load-theme 'tango)
    (load-theme 'wombat) ;; else {}
    )

;; 让emacs 标题显示当前buffer名字
(setq frame-title-format "%b@emacs")

;; 高亮当前行
(global-hl-line-mode t)

;; fill-column-indicator
(require 'fill-column-indicator)
(setq-default fci-rule-column 80)
(setq fci-handle-truncate-lines nil)
(define-globalized-minor-mode global-fci-mode fci-mode (lambda () (fci-mode 1)))
(global-fci-mode 1)
(defun auto-fci-mode (&optional unused)
  (if (> (window-width) fci-rule-column)
      (fci-mode 1)
    (fci-mode 0))
  )
(add-hook 'after-change-major-mode-hook 'auto-fci-mode)
(add-hook 'window-configuration-change-hook 'auto-fci-mode)




(provide 'init-ui)

;; author: qzi
;; email: i@qzier.com
;; content: git

 (eval-after-load "magit"
   '(set-face-attribute 'magit-item-highlight nil :foreground "#ffffff" :background "#3f4747"))

;; ediff
(setq ediff-split-window-function 'split-window-horizontally)

(provide 'init-vcs)

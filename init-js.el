;; author: qzi
;; email: i@qzier.com
;; content: js

;; desc: js-comint
;; deps: node.js
;;
(require 'js-comint)
(setq inferior-js-program-command "node")
(setq inferior-js-mode-hook
      (lambda ()
        ;; We like nice colors
        (ansi-color-for-comint-mode-on)
        ;; Deal with some prompt nonsense
        (add-to-list
         'comint-preoutput-filter-functions
         (lambda (output)
           (replace-regexp-in-string "\033\\[[0-9]+[JG]" "" output)))))


(provide 'init-js)

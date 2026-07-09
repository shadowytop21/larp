local configs = require("lspconfig.configs")
local lspconfig = require("lspconfig")

if not configs.larpls then
  configs.larpls = {
    default_config = {
      cmd = { "node", vim.fn.expand("~/.local/share/larp/dist/lsp/server.js"), "--stdio" },
      filetypes = { "larp" },
      root_dir = function(fname)
        return lspconfig.util.root_pattern(".git", "package.json")(fname) or vim.fn.getcwd()
      end,
      settings = {},
    },
  }
end

lspconfig.larpls.setup({})

-- Filetype detection
vim.filetype.add({
  extension = {
    larp = "larp",
  },
})

-- Basic syntax highlighting (treesitter not available yet, using vim regexes)
vim.cmd([[
  augroup LarpSyntax
    autocmd!
    autocmd BufRead,BufNewFile *.larp set filetype=larp
  augroup END
]])

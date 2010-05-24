var sys = require('sys'),
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    Buffer = require('buffer').Buffer;
    
sys.puts('Calculator running on http://localhost:6666/');

http.createServer(function (req, res) {
  var expr = url.parse(req.url).pathname.substr(1);
  
  if (expr == 'css') return css(res);
  
  var _ = null;
  try {
    var result = eval(expr).toString();
    render(res, 'expr', {
      'expression': expr,
      'result': result
    });
  } catch(e) {
    errorHandler(res, 'Invalid expression. Bad boy!');
  }
}).listen(6666);

function css(res) {
  fs.readFile('./styles.css', function (err, data) {
    if (err) return errorHandler(res, err);
    res.writeHead(200, {'Content-Type': 'text/css'});
    res.end(data);
  });
};

function errorHandler(res, errorMessage) {
  res.writeHead(500, {'Content-Type': 'text/plain'});
  res.end(errorMessage.toString());
};

function render(res, templateName, values) {
  withTemplate(res, 'expr', function(template) {
    var result = template;
    for (var key in values) {
      result = result.replace(new RegExp('\{\{' + key + '\}\}', 'g'), values[key]);
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(result);
  });
};

var templates = {};
function withTemplate(res, template, callback) {
  if (template in templates)
    return callback(templates[template]);
  else
    fs.readFile('./' + template + '.html', function (err, data) {
      if (err) return errorHandler(res, err);
      var t = templates[template] = data.toString();
      callback(t);
    });
};
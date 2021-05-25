'use strict';

function cookRawQuasi({transform}, raw) {
	// This nasty hack is needed until https://github.com/babel/babel/issues/9242 is resolved.
	const args = {raw};

	transform('cooked`' + args.raw + '`', {
		babelrc: false,
		configFile: false,
		plugins: [
			{
				visitor: {
					TaggedTemplateExpression(path) {
						args.cooked = path.get('quasi').node.quasis[0].value.cooked;
					}
				}
			}
		]
	});

	return args;
}

module.exports = cookRawQuasi;

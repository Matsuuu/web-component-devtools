# Custom Element Tree

## Usage

### Generate a Custom Element Tree

```javascript
const tree = new CustomElementTree();
```

### Log the tree structure

```javascript
tree.logTree();
// or
tree.logTreeCollapsed();
```

```markdown
Custom Element Tree
|_<my-wrapper>
  |_<list-wrapper>
    |_<list-item>
    |_<list-item>
    |_<list-item>
  |_<list-wrapper>
    |_<list-item>
    |_<list-item>
    |_<list-item>
  |_<list-wrapper>
    |_<list-item>
    |_<list-item>
    |_<list-item>
```

### Get the tree nodes as a flat array

```javascript
tree.flat();

// [{...}, {...}, {...}, {...}]
```

### Access nodes in tree

```javascript
tree.elements[1].children[0].children[2];
// > CustomElementNode { id: 552255 tagName: "tree-item", ...}
```

### Query trees in the node

```javascript
const treeItem = tree.elements[1].children[0].children[2];
const otherTreeItem = tree.elements[1];

treeItem.isChildOf(otherTreeItem);
// true
otherTreeItem.isParentOf(treeItem);
// true
otherTreeItem.isSiblingOf(treeItem);
// false
```

### Get children recursively

```javascript
const treeItem = tree.elements[1].children[0];

treeItem.allChildren();
// [{...}, {...}, {...}, {...}]
```

## Custom Element Node API

### CustomElementNode

##### Properties

| Name         | Type                       | Description                                                                                                      |
| ------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| id           | number                     | A randomly assigned unique ID to identify a tree element                                                         |
| tagName      | string                     | HTML Tag name of custom element                                                                                  |
| element      | HTMLElement                | The HTML element reference of the CustomElementNode                                                              |
| parent       | CustomElementNode          | The Custom Element Node of custom element node's parent                                                          |
| parentId     | number                     | The id number of the custom element node's parent. Same as `node.parent.id`                                      |
| document     | Document                   | The ownerDocument of the CustomElementNode's element                                                             |
| root         | Node                       | The rootNode of the CustomElementNode's element                                                                  |
| children     | `Array<CustomElementNode>` | Array of CustomElementNodes that are children of this CustomElementNode and not children of a child of this node |
| siblings     | `Array<CustomElementNode>` | Array of CustomElementNodes that are siblings of this CustomElementNode                                          |
| inShadowRoot | boolean                    | Tells is the CustomElementNode's element is in the shadowRoot of the parent node's element                       |

##### Methods

| Name                   | Returns                                        |
| ---------------------- | ---------------------------------------------- |
| isChildOf(otherNode)   | If the caller is a child of the passed node    |
| isParentOf(otherNode)  | If the caller is a paren of the passed node    |
| isSiblingOf(otherNode) | If the caller is a sibling of the passed node  |
| allChildren()          | A array of all children of caller, recursively |
| logNode()              | Logs the node's data to the developer console  |

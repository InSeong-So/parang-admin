/**
 * @description 메뉴 트리에서 모든 uniqueId 추출
 * @param tree 배열
 * @returns 각 uniqueId로 구성된 배열
 */
export const extractPathList = (tree: any[]): any => {
  if (!Array.isArray(tree)) {
    console.warn('tree must be an array');
    return [];
  }
  if (!tree || tree.length === 0) return [];
  const expandedPaths: Array<number | string> = [];
  for (const node of tree) {
    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      extractPathList(node.children);
    }
    expandedPaths.push(node.uniqueId);
  }
  return expandedPaths;
};

/**
 * @description 부모 아래 children의 length가 1이면 children을 삭제하고 고유한 uniqueId를 자동으로 만듭니다.
 * @param tree 배열
 * @param pathList 각 항목의 id로 구성된 배열
 * @returns 구성 요소 유니크 uniqueId 이후의 트리
 */
export const deleteChildren = (tree: any[], pathList = []): any => {
  if (!Array.isArray(tree)) {
    console.warn('menuTree must be an array');
    return [];
  }
  if (!tree || tree.length === 0) return [];
  for (const [key, node] of tree.entries()) {
    if (node.children && node.children.length === 1) delete node.children;
    node.id = key;
    node.parentId = pathList.length ? pathList[pathList.length - 1] : null;
    node.pathList = [...pathList, node.id];
    node.uniqueId = node.pathList.length > 1 ? node.pathList.join('-') : node.pathList[0];
    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      deleteChildren(node.children, node.pathList);
    }
  }
  return tree;
};

/**
 * @description 계층 관계 만들기
 * @param tree 배열
 * @param pathList 각 항목의 id로 구성된 배열
 * @returns 계층 관계 생성 후 트리
 */
export const buildHierarchyTree = (tree: any[], pathList = []): any => {
  if (!Array.isArray(tree)) {
    console.warn('tree must be an array');
    return [];
  }
  if (!tree || tree.length === 0) return [];
  for (const [key, node] of tree.entries()) {
    node.id = key;
    node.parentId = pathList.length ? pathList[pathList.length - 1] : null;
    node.pathList = [...pathList, node.id];
    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      buildHierarchyTree(node.children, node.pathList);
    }
  }
  return tree;
};

/**
 * @description 너비 우선 순번, 유니크 uniqueId에 따라 현재 노드 정보 찾기
 * @param tree 배열
 * @param uniqueId 유니크 아이디
 * @returns 현재 노드 정보
 */
export const getNodeByUniqueId = (tree: any[], uniqueId: number | string): any => {
  if (!Array.isArray(tree)) {
    console.warn('menuTree must be an array');
    return [];
  }
  if (!tree || tree.length === 0) return [];
  const item = tree.find((node) => node.uniqueId === uniqueId);
  if (item) return item;
  const childrenList = tree
    .filter((node) => node.children)
    .map((i) => i.children)
    .flat(1) as unknown;
  return getNodeByUniqueId(childrenList as any[], uniqueId);
};

/**
 * @description 현재 유일한 uniqueId 노드에 필드 추가
 * @param tree 배열
 * @param uniqueId 유니크 아이디
 * @param fields 추가할 필드
 * @returns 필드 추가 후 트리
 */
export const appendFieldByUniqueId = (
  tree: any[],
  uniqueId: number | string,
  fields: object,
): any => {
  if (!Array.isArray(tree)) {
    console.warn('menuTree must be an array');
    return [];
  }
  if (!tree || tree.length === 0) return [];
  for (const node of tree) {
    const hasChildren = node.children && node.children.length > 0;
    if (node.uniqueId === uniqueId && Object.prototype.toString.call(fields) === '[object Object]')
      Object.assign(node, fields);
    if (hasChildren) {
      appendFieldByUniqueId(node.children, uniqueId, fields);
    }
  }
  return tree;
};

/**
 * @description 트리 구조 데이터 생성
 * @param data 데이터 배열
 * @param id id 필드의 기본 아이디값
 * @param parentId 부모 노드 필드, 기본 parentId
 * @param children 하위 노드 필드, 기본 children
 * @returns 필드 추가 후 트리
 */
export const handleTree = (data: any[], id?: string, parentId?: string, children?: string): any => {
  if (!Array.isArray(data)) {
    console.warn('data must be an array');
    return [];
  }
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children',
  };

  const childrenListMap: any = {};
  const nodeIds: any = {};
  const tree = [];

  for (const d of data) {
    const parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (const d of data) {
    const parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o: Record<string, any>) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
};

// This is an auto-generated file, do not edit manually
export const definition = {"models":{"BasicProfile":{"id":"kjzl6hvfrbw6caorp3qqn7dbdlsvm4gxatm12vyz7roeew41wqwkjv5n0l50mic","accountRelation":{"type":"single"}},"Message":{"id":"kjzl6hvfrbw6c8dba3pj01co9wlpzrfg3l4eekxav7c0bcf44ncpzxbbwub3wp7","accountRelation":{"type":"list"}}},"objects":{"BasicProfile":{"name":{"type":"string","required":true},"emoji":{"type":"string","required":false},"gender":{"type":"string","required":false},"description":{"type":"string","required":false}},"Message":{"chain":{"type":"string","required":true},"symKey":{"type":"string","required":true},"encryptedMessage":{"type":"string","required":true},"accessControlConditions":{"type":"string","required":true},"accessControlConditionType":{"type":"string","required":false},"author":{"type":"view","viewType":"documentAccount"}}},"enums":{},"accountData":{"basicProfile":{"type":"node","name":"BasicProfile"},"messageList":{"type":"connection","name":"Message"}}}